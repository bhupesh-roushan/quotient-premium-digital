"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.bulkImportRouter = void 0;
const express_1 = require("express");
const requireAuth_1 = require("../middleware/requireAuth");
const Product_1 = require("../models/Product");
const slug_1 = require("../lib/slug");
const mongoose_1 = __importDefault(require("mongoose"));
exports.bulkImportRouter = (0, express_1.Router)();
exports.bulkImportRouter.use(requireAuth_1.requireAuth);
// Bulk import products from JSON
exports.bulkImportRouter.post("/json", async (req, res) => {
    try {
        const { products } = req.body;
        if (!Array.isArray(products) || products.length === 0) {
            return res.status(400).json({
                ok: false,
                error: "Products array is required",
            });
        }
        if (products.length > 50) {
            return res.status(400).json({
                ok: false,
                error: "Maximum 50 products can be imported at once",
            });
        }
        const results = {
            successful: [],
            failed: [],
        };
        const creatorId = new mongoose_1.default.Types.ObjectId(req.user.id);
        for (let i = 0; i < products.length; i++) {
            const productData = products[i];
            try {
                // Validate required fields
                if (!productData.title || !productData.category) {
                    results.failed.push({
                        index: i,
                        error: "Missing required fields: title, category",
                    });
                    continue;
                }
                // Generate unique slug
                const baseSlug = productData.slug || productData.title.toLowerCase().replace(/[^a-z0-9]+/g, "-");
                const slug = await (0, slug_1.ensureUniqueSlug)(baseSlug, async (s) => {
                    const existing = await Product_1.Product.findOne({ slug: s });
                    return !existing;
                });
                // Create product
                const product = await Product_1.Product.create({
                    creatorId,
                    title: productData.title,
                    slug,
                    description: productData.description || "",
                    category: productData.category,
                    price: productData.price || 0,
                    currency: productData.currency || "INR",
                    visibility: productData.visibility || "draft",
                    license: productData.license || "Personal Use",
                    deliverables: productData.deliverables || [],
                    seo: {
                        title: productData.seo?.title || productData.title,
                        description: productData.seo?.description || productData.description || "",
                        keywords: productData.seo?.keywords || productData.tags || [],
                        tags: productData.tags || [],
                    },
                    page: {
                        sections: productData.page?.sections || [],
                        pricingTiers: productData.page?.pricingTiers || [],
                    },
                    stats: {
                        viewCount: 0,
                        soldCount: 0,
                        revenue: 0,
                        averageRating: 0,
                        reviewCount: 0,
                        conversionRate: 0,
                    },
                });
                results.successful.push({
                    index: i,
                    productId: String(product._id),
                    title: product.title,
                    slug: product.slug,
                });
            }
            catch (error) {
                results.failed.push({
                    index: i,
                    error: String(error),
                });
            }
        }
        res.json({
            ok: true,
            results,
            summary: {
                total: products.length,
                successful: results.successful.length,
                failed: results.failed.length,
            },
        });
    }
    catch (error) {
        console.error("Bulk import failed:", error);
        res.status(500).json({
            ok: false,
            error: "Bulk import failed",
        });
    }
});
// Bulk import from CSV
exports.bulkImportRouter.post("/csv", async (req, res) => {
    try {
        const { csvData } = req.body;
        if (!csvData || typeof csvData !== "string") {
            return res.status(400).json({
                ok: false,
                error: "CSV data is required",
            });
        }
        // Parse CSV
        const lines = csvData.trim().split("\n");
        if (lines.length < 2) {
            return res.status(400).json({
                ok: false,
                error: "CSV must have header and at least one data row",
            });
        }
        const headers = lines[0].split(",").map((h) => h.trim().replace(/^"|"$/g, ""));
        const requiredHeaders = ["title", "category"];
        for (const required of requiredHeaders) {
            if (!headers.includes(required)) {
                return res.status(400).json({
                    ok: false,
                    error: `Missing required header: ${required}`,
                });
            }
        }
        const products = [];
        for (let i = 1; i < lines.length; i++) {
            const values = parseCSVLine(lines[i]);
            if (values.length !== headers.length)
                continue;
            const product = {};
            headers.forEach((header, index) => {
                const value = values[index];
                // Handle special fields
                if (header === "price") {
                    product[header] = parseFloat(value) || 0;
                }
                else if (header === "tags") {
                    product[header] = value.split(";").map((t) => t.trim()).filter(Boolean);
                }
                else if (header === "deliverables") {
                    try {
                        product[header] = JSON.parse(value);
                    }
                    catch {
                        product[header] = [];
                    }
                }
                else {
                    product[header] = value;
                }
            });
            products.push(product);
        }
        // Forward to JSON import handler
        req.body = { products };
        res.json({
            ok: true,
            message: "CSV parsed successfully",
            productCount: products.length,
            // Note: In production, this would actually import the products
            // For now, just return the parsed data
            sample: products.slice(0, 3),
        });
    }
    catch (error) {
        console.error("CSV import failed:", error);
        res.status(500).json({
            ok: false,
            error: "CSV import failed",
        });
    }
});
// Validate import data without importing
exports.bulkImportRouter.post("/validate", async (req, res) => {
    try {
        const { products } = req.body;
        if (!Array.isArray(products)) {
            return res.status(400).json({
                ok: false,
                error: "Products array is required",
            });
        }
        const validationResults = products.map((product, index) => {
            const errors = [];
            const warnings = [];
            // Required fields
            if (!product.title)
                errors.push("Title is required");
            if (!product.category)
                errors.push("Category is required");
            // Validation
            if (product.title && product.title.length > 100) {
                errors.push("Title must be less than 100 characters");
            }
            if (product.price && (isNaN(product.price) || product.price < 0)) {
                errors.push("Price must be a positive number");
            }
            if (product.description && product.description.length > 5000) {
                warnings.push("Description is very long (consider shortening)");
            }
            // Check for duplicate slugs in the import batch
            const duplicateSlug = products.find((p, i) => i !== index && p.slug === product.slug && p.slug);
            if (duplicateSlug) {
                errors.push(`Duplicate slug with product at index ${products.indexOf(duplicateSlug)}`);
            }
            return {
                index,
                valid: errors.length === 0,
                errors,
                warnings,
            };
        });
        const validCount = validationResults.filter((r) => r.valid).length;
        res.json({
            ok: true,
            results: validationResults,
            summary: {
                total: products.length,
                valid: validCount,
                invalid: products.length - validCount,
            },
        });
    }
    catch (error) {
        console.error("Validation failed:", error);
        res.status(500).json({
            ok: false,
            error: "Validation failed",
        });
    }
});
// Get import template
exports.bulkImportRouter.get("/template", async (req, res) => {
    try {
        const format = req.query.format || "json";
        if (format === "csv") {
            const csvTemplate = `title,category,subcategory,price,currency,description,tags,visibility
"My Product","ai-prompt-pack","marketing",99,"INR","A great AI prompt pack","ai;marketing;productivity","published"
"Another Product","notion-template","productivity",49,"INR","Notion template for productivity","notion;template","draft"`;
            res.setHeader("Content-Type", "text/csv");
            res.setHeader("Content-Disposition", "attachment; filename=import-template.csv");
            res.send(csvTemplate);
        }
        else {
            const jsonTemplate = {
                products: [
                    {
                        title: "My Product",
                        category: "ai-prompt-pack",
                        subcategory: "marketing",
                        price: 99,
                        currency: "INR",
                        description: "A great AI prompt pack",
                        tags: ["ai", "marketing", "productivity"],
                        visibility: "published",
                        deliverables: [
                            {
                                name: "README.md",
                                type: "file",
                                url: "https://example.com/readme.md",
                            },
                        ],
                    },
                ],
            };
            res.json({
                ok: true,
                template: jsonTemplate,
            });
        }
    }
    catch (error) {
        console.error("Failed to get template:", error);
        res.status(500).json({
            ok: false,
            error: "Failed to get template",
        });
    }
});
// Helper function to parse CSV line
function parseCSVLine(line) {
    const result = [];
    let current = "";
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
        const char = line[i];
        if (char === '"') {
            inQuotes = !inQuotes;
        }
        else if (char === ',' && !inQuotes) {
            result.push(current.trim());
            current = "";
        }
        else {
            current += char;
        }
    }
    result.push(current.trim());
    return result.map((v) => v.replace(/^"|"$/g, ""));
}

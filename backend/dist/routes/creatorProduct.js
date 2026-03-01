"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.creatorProductRouter = void 0;
const express_1 = require("express");
const mongoose_1 = __importDefault(require("mongoose"));
const requireAuth_1 = require("../middleware/requireAuth");
const Product_1 = require("../models/Product");
const ImageAsset_1 = require("../models/ImageAsset");
const Order_1 = require("../models/Order");
// Utility functions
function toSlug(text) {
    return text
        .toLowerCase()
        .replace(/[^\w\s-]/g, '') // Remove special characters
        .replace(/\s+/g, '-') // Replace spaces with hyphens
        .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
        .trim();
}
async function ensureUniqueSlug(baseSlug, checkExists) {
    let slug = baseSlug;
    let counter = 1;
    while (await checkExists(slug)) {
        slug = `${baseSlug}-${counter}`;
        counter++;
    }
    return slug;
}
exports.creatorProductRouter = (0, express_1.Router)();
exports.creatorProductRouter.use(requireAuth_1.requireAuth);
// Create Product with enhanced metadata support
exports.creatorProductRouter.post("/", async (req, res) => {
    try {
        console.log("Received product data:", JSON.stringify(req.body, null, 2));
        const { title, price, category, description, template, codeTemplate } = req.body ?? {};
        if (!title || typeof price !== "number") {
            return res.status(400).json({
                ok: false,
                error: "title and price are required",
                received: { title, price, category, description }
            });
        }
        // Validate category
        const validCategories = [
            "ai-prompt-pack",
            "notion-template",
            "resume-template",
            "ui-kit",
            "figma-assets",
            "productivity-dashboard",
            "dev-boilerplate",
            "mern-starter",
            "auth-system",
            "saas-starter",
            "api-scaffold",
            "workflow-system",
            "automation-pipeline",
            "ai-productivity",
            "business-guide",
            "automation-guide",
            "productivity-framework",
            // Code template categories
            "react-template",
            "vue-template",
            "angular-template",
            "javascript-component",
            "typescript-component",
            "css-template",
            "html-template"
        ];
        if (!category || !validCategories.includes(category)) {
            return res.status(400).json({
                ok: false,
                error: `Invalid category: "${category}". Valid categories are: ${validCategories.join(", ")}`,
                received: { title, price, category, description }
            });
        }
        // Ensure description is provided
        const productDescription = description || `A high-quality ${category.replace('-', ' ')} for creators and professionals.`;
        console.log("Processed product data:", { title, price, category, productDescription });
        const baseSlug = toSlug(String(title));
        const slug = await ensureUniqueSlug(baseSlug, async (s) => {
            const count = await Product_1.Product.countDocuments({ slug: s });
            return count > 0;
        });
        const creatorId = new mongoose_1.default.Types.ObjectId(req.user.id);
        // Enhanced product creation with category-specific metadata
        const productData = {
            creatorId,
            title: String(title),
            description: productDescription,
            price: Number(price),
            currency: "INR",
            visibility: "draft",
            slug,
            coverImageAssetId: null,
            category: category,
            stats: {
                viewCount: 0,
                soldCount: 0,
                revenue: 0,
                averageRating: 0,
                reviewCount: 0,
                conversionRate: 0,
            },
        };
        // Add category-specific metadata
        if (category) {
            productData.template = {
                kind: category,
                tool: "other",
                installInstructions: "",
                deliverables: [],
                page: { sections: [], pricingTiers: [] },
            };
        }
        // Handle AI Prompt Pack specific metadata
        if (category === "ai-prompt-pack") {
            productData.template = {
                kind: category,
                tool: "other",
                installInstructions: "",
                deliverables: [],
                page: { sections: [], pricingTiers: [] },
            };
        }
        // Handle Developer Boilerplate specific metadata
        if (category === "dev-boilerplate") {
            productData.template = {
                kind: category,
                tool: "other",
                installInstructions: "",
                deliverables: [],
                page: { sections: [], pricingTiers: [] },
            };
        }
        // Handle Workflow System specific metadata
        if (category === "workflow-system") {
            productData.template = {
                kind: category,
                tool: "other",
                installInstructions: "",
                deliverables: [],
                page: { sections: [], pricingTiers: [] },
            };
        }
        // Handle UI Kit specific metadata
        if (category === "ui-kit") {
            productData.template = {
                kind: category,
                tool: "other",
                installInstructions: "",
                deliverables: [],
                page: { sections: [], pricingTiers: [] },
            };
        }
        // Handle Productivity Framework specific metadata
        if (category === "productivity-framework") {
            productData.template = {
                kind: category,
                tool: "other",
                installInstructions: "",
                deliverables: [],
                page: { sections: [], pricingTiers: [] },
            };
        }
        // Handle Automation Guide specific metadata
        if (category === "automation-guide") {
            productData.template = {
                kind: category,
                tool: "other",
                installInstructions: "",
                deliverables: [],
                page: { sections: [], pricingTiers: [] },
            };
        }
        // Handle Resume Template specific metadata
        if (category === "resume-template") {
            productData.template = {
                kind: category,
                tool: "other",
                installInstructions: "",
                deliverables: [],
                page: { sections: [], pricingTiers: [] },
            };
        }
        // Handle Figma Assets specific metadata
        if (category === "figma-assets") {
            productData.template = {
                kind: category,
                tool: "other",
                installInstructions: "",
                deliverables: [],
                page: { sections: [], pricingTiers: [] },
            };
        }
        // Handle MERN Starter specific metadata
        if (category === "mern-starter") {
            productData.template = {
                kind: category,
                tool: "other",
                installInstructions: "",
                deliverables: [],
                page: { sections: [], pricingTiers: [] },
            };
        }
        // Handle Auth System specific metadata
        if (category === "auth-system") {
            productData.template = {
                kind: category,
                tool: "other",
                installInstructions: "",
                deliverables: [],
                page: { sections: [], pricingTiers: [] },
            };
        }
        // Handle SaaS Starter specific metadata
        if (category === "saas-starter") {
            productData.template = {
                kind: category,
                tool: "other",
                installInstructions: "",
                deliverables: [],
                page: { sections: [], pricingTiers: [] },
            };
        }
        // Handle API Scaffold specific metadata
        if (category === "api-scaffold") {
            productData.template = {
                kind: category,
                tool: "other",
                installInstructions: "",
                deliverables: [],
                page: { sections: [], pricingTiers: [] },
            };
        }
        // Handle AI Productivity specific metadata
        if (category === "ai-productivity") {
            productData.template = {
                kind: category,
                tool: "other",
                installInstructions: "",
                deliverables: [],
                page: { sections: [], pricingTiers: [] },
            };
        }
        // Handle Business Guide specific metadata
        if (category === "business-guide") {
            productData.template = {
                kind: category,
                tool: "other",
                installInstructions: "",
                deliverables: [],
                page: { sections: [], pricingTiers: [] },
            };
        }
        // Handle Automation Pipeline specific metadata
        if (category === "automation-pipeline") {
            productData.template = {
                kind: category,
                tool: "other",
                installInstructions: "",
                deliverables: [],
                page: { sections: [], pricingTiers: [] },
            };
        }
        // Handle React Template specific metadata
        if (category === "react-template") {
            productData.template = {
                kind: category,
                tool: "react",
                installInstructions: "",
                deliverables: [],
                page: { sections: [], pricingTiers: [] },
            };
        }
        // Handle Vue Template specific metadata
        if (category === "vue-template") {
            productData.template = {
                kind: category,
                tool: "vue",
                installInstructions: "",
                deliverables: [],
                page: { sections: [], pricingTiers: [] },
            };
        }
        // Handle Angular Template specific metadata
        if (category === "angular-template") {
            productData.template = {
                kind: category,
                tool: "angular",
                installInstructions: "",
                deliverables: [],
                page: { sections: [], pricingTiers: [] },
            };
        }
        // Handle JavaScript Component specific metadata
        if (category === "javascript-component") {
            productData.template = {
                kind: category,
                tool: "javascript",
                installInstructions: "",
                deliverables: [],
                page: { sections: [], pricingTiers: [] },
            };
        }
        // Handle TypeScript Component specific metadata
        if (category === "typescript-component") {
            productData.template = {
                kind: category,
                tool: "typescript",
                installInstructions: "",
                deliverables: [],
                page: { sections: [], pricingTiers: [] },
            };
        }
        // Handle CSS Template specific metadata
        if (category === "css-template") {
            productData.template = {
                kind: category,
                tool: "css",
                installInstructions: "",
                deliverables: [],
                page: { sections: [], pricingTiers: [] },
            };
        }
        // Handle HTML Template specific metadata
        if (category === "html-template") {
            productData.template = {
                kind: category,
                tool: "html",
                installInstructions: "",
                deliverables: [],
                page: { sections: [], pricingTiers: [] },
            };
        }
        // Handle code template metadata if provided
        if (codeTemplate && typeof codeTemplate === "object") {
            productData.codeTemplate = codeTemplate;
        }
        // Add template metadata if provided
        if (template && typeof template === "object") {
            productData.template = {
                ...productData.template,
                ...template,
            };
        }
        // Handle componentDeliverables if provided (for code templates)
        if (req.body.componentDeliverables && Array.isArray(req.body.componentDeliverables)) {
            if (!productData.template) {
                productData.template = {};
            }
            productData.template.componentDeliverables = req.body.componentDeliverables;
        }
        const product = await Product_1.Product.create(productData);
        // TODO: Update user creator status when User model is properly imported
        // await User.updateOne(
        //   {
        //     _id: creatorId,
        //     isCreator: false,
        //   },
        //   {
        //     $set: { isCreator: true },
        //   }
        // );
        return res.json({ ok: true, product });
    }
    catch (e) {
        console.log(e);
        res.status(500).json({
            ok: false,
            error: "Internal server error",
        });
    }
});
// Get product stats for analytics - MUST be before /:productId routes
exports.creatorProductRouter.get("/stats", async (req, res) => {
    try {
        const creatorId = req.user.id;
        console.log("Fetching stats for creator:", creatorId);
        const products = await Product_1.Product.find({ creatorId }).lean();
        console.log("Found products:", products.length);
        // Get order stats for each product
        const productStats = await Promise.all(products.map(async (product) => {
            const orders = await Order_1.Order.find({
                productId: product._id,
                status: "paid",
            }).lean();
            const revenue = orders.reduce((sum, order) => sum + (order.amount || 0), 0);
            const soldCount = orders.length;
            const views = product.stats?.viewCount || 0;
            const conversionRate = views > 0 ? (soldCount / views) * 100 : 0;
            return {
                productId: String(product._id),
                title: product.title,
                viewCount: views,
                soldCount,
                revenue,
                conversionRate,
                averageRating: product.stats?.averageRating || 0,
            };
        }));
        res.json({
            ok: true,
            products: productStats,
        });
    }
    catch (error) {
        console.error("Failed to get product stats:", error);
        res.status(500).json({
            ok: false,
            error: "Failed to get product stats",
        });
    }
});
// Get creator's revenue analytics
exports.creatorProductRouter.get("/revenue", async (req, res) => {
    try {
        const creatorId = req.user.id;
        const days = parseInt(req.query.days) || 30;
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);
        // Aggregate orders by date for this creator's products
        const revenueData = await Order_1.Order.aggregate([
            {
                $match: {
                    status: "paid",
                    paidAt: { $gte: startDate },
                },
            },
            {
                $lookup: {
                    from: "products",
                    localField: "productId",
                    foreignField: "_id",
                    as: "product",
                },
            },
            { $unwind: "$product" },
            {
                $match: {
                    "product.creatorId": new mongoose_1.default.Types.ObjectId(creatorId),
                },
            },
            {
                $group: {
                    _id: {
                        $dateToString: { format: "%Y-%m-%d", date: "$paidAt" },
                    },
                    revenue: { $sum: "$amount" },
                    orders: { $sum: 1 },
                },
            },
            { $sort: { _id: 1 } },
        ]);
        res.json({
            ok: true,
            data: revenueData,
        });
    }
    catch (error) {
        console.error("Failed to get creator revenue:", error);
        res.status(500).json({
            ok: false,
            error: "Failed to get revenue data",
        });
    }
});
// Update Product with category-specific metadata handling
exports.creatorProductRouter.patch("/:productId", async (req, res) => {
    try {
        // TODO: Implement loadOwnProduct function
        // const { product } = await loadOwnProduct(req);
        // For now, let's find the product directly
        const product = await Product_1.Product.findOne({
            _id: req.params.productId,
            creatorId: req.user.id,
        });
        if (!product) {
            return res.status(400).json({
                ok: false,
                error: "Product not found",
            });
        }
        const { title, description, price, category, template } = req.body ?? {};
        // Update basic fields
        if (typeof title === "string" && title.trim()) {
            product.title = title.trim();
            const baseSlug = toSlug(product.title);
            const slug = await ensureUniqueSlug(baseSlug, async (s) => {
                const existing = await Product_1.Product.findOne({ slug: s }).lean();
                return !!(existing && String(existing._id) !== String(product._id));
            });
            if (slug !== product.slug)
                product.slug = slug;
        }
        if (typeof description === "string" && description.trim()) {
            product.description = description.trim();
        }
        if (typeof price === "number") {
            product.price = price;
        }
        // Update category
        if (category) {
            product.category = category;
        }
        // Update top-level install instructions
        if (req.body.installInstructions !== undefined) {
            product.installInstructions = String(req.body.installInstructions);
            product.markModified('installInstructions');
        }
        // Update top-level deliverables if provided
        if (req.body.deliverables !== undefined && Array.isArray(req.body.deliverables)) {
            product.deliverables = req.body.deliverables;
            product.markModified('deliverables');
        }
        // Update code template data if provided
        if (req.body.codeFiles !== undefined) {
            if (!product.codeTemplate) {
                product.codeTemplate = {};
            }
            product.codeTemplate.codeFiles = req.body.codeFiles;
            if (req.body.framework)
                product.codeTemplate.framework = req.body.framework;
            if (req.body.language)
                product.codeTemplate.language = req.body.language;
            if (req.body.componentType)
                product.codeTemplate.componentType = req.body.componentType;
            if (req.body.dependencies)
                product.codeTemplate.dependencies = req.body.dependencies;
            if (req.body.hasLivePreview !== undefined)
                product.codeTemplate.hasLivePreview = req.body.hasLivePreview;
            if (req.body.sandboxEnabled !== undefined)
                product.codeTemplate.sandboxEnabled = req.body.sandboxEnabled;
            product.markModified('codeTemplate');
        }
        // Update template metadata (only for template-specific fields)
        if (template && typeof template === "object") {
            // Ensure template object exists with proper typing
            if (!product.template) {
                product.template = {
                    templateType: category || product.category,
                };
            }
            // Only update fields that exist in TemplateMetadata schema
            const templateUpdate = {};
            if (template.compatibility !== undefined)
                templateUpdate.compatibility = template.compatibility;
            if (template.features !== undefined)
                templateUpdate.features = template.features;
            if (template.customizationLevel !== undefined)
                templateUpdate.customizationLevel = template.customizationLevel;
            if (template.includesAssets !== undefined)
                templateUpdate.includesAssets = template.includesAssets;
            Object.assign(product.template, templateUpdate);
            product.markModified('template');
        }
        // Update componentDeliverables if provided (for code templates)
        if (req.body.componentDeliverables !== undefined && Array.isArray(req.body.componentDeliverables)) {
            if (!product.template) {
                product.template = {};
            }
            product.template.componentDeliverables = req.body.componentDeliverables;
            product.markModified('template');
        }
        // Update tags
        if (req.body.tags !== undefined && Array.isArray(req.body.tags)) {
            product.tags = req.body.tags;
            product.markModified('tags');
        }
        // Update aiPromptPack metadata
        if (req.body.aiPromptPack !== undefined && typeof req.body.aiPromptPack === 'object') {
            product.aiPromptPack = {
                ...(product.aiPromptPack || {}),
                ...req.body.aiPromptPack,
            };
            product.markModified('aiPromptPack');
        }
        // Update developerBoilerplate metadata
        if (req.body.developerBoilerplate !== undefined && typeof req.body.developerBoilerplate === 'object') {
            product.developerBoilerplate = {
                ...(product.developerBoilerplate || {}),
                ...req.body.developerBoilerplate,
            };
            product.markModified('developerBoilerplate');
        }
        // Update workflowSystem metadata
        if (req.body.workflowSystem !== undefined && typeof req.body.workflowSystem === 'object') {
            product.workflowSystem = {
                ...(product.workflowSystem || {}),
                ...req.body.workflowSystem,
            };
            product.markModified('workflowSystem');
        }
        // Update automationGuide metadata
        if (req.body.automationGuide !== undefined && typeof req.body.automationGuide === 'object') {
            product.automationGuide = {
                ...(product.automationGuide || {}),
                ...req.body.automationGuide,
            };
            product.markModified('automationGuide');
        }
        // Update productivityFramework metadata
        if (req.body.productivityFramework !== undefined && typeof req.body.productivityFramework === 'object') {
            product.productivityFramework = {
                ...(product.productivityFramework || {}),
                ...req.body.productivityFramework,
            };
            product.markModified('productivityFramework');
        }
        await product.save();
        return res.json({ ok: true, product });
    }
    catch (e) {
        console.log(e);
        res.status(500).json({
            ok: false,
            error: "Internal server error",
        });
    }
});
// Delete Product
exports.creatorProductRouter.delete("/:productId", async (req, res) => {
    try {
        const { productId } = req.params;
        // Import Order model
        const { Order } = await Promise.resolve().then(() => __importStar(require("../models/Order")));
        // Check if product has been purchased
        const hasBuyers = await Order.exists({
            productId: new mongoose_1.default.Types.ObjectId(productId),
            status: "paid"
        });
        if (hasBuyers) {
            return res.status(400).json({
                ok: false,
                error: "Cannot delete template that has been purchased",
            });
        }
        const product = await Product_1.Product.findOne({
            _id: productId,
            creatorId: req.user.id,
        });
        if (!product) {
            return res.status(400).json({
                ok: false,
                error: "Product not found",
            });
        }
        await Product_1.Product.deleteOne({ _id: productId });
        return res.json({ ok: true, message: "Product deleted successfully" });
    }
    catch (e) {
        console.log(e);
        res.status(500).json({
            ok: false,
            error: "Internal server error",
        });
    }
});
// Get Products for Creator
exports.creatorProductRouter.get("/", async (req, res) => {
    try {
        const products = await Product_1.Product.find({ creatorId: req.user.id })
            .sort({ createdAt: -1 })
            .populate({
            path: 'coverImageAssetId',
            model: 'ImageAsset',
            select: 'cloudinary.secureUrl _id'
        })
            .lean();
        // Transform products to include preview images and description
        const transformedProducts = products.map(product => {
            // Get preview images from deliverables that are image URLs
            const previewImages = (product.deliverables || [])
                .filter((d) => d.url && d.url.includes('http') && (d.url.includes('.jpg') || d.url.includes('.png') || d.url.includes('.jpeg') || d.url.includes('.webp')))
                .slice(0, 3)
                .map((d) => ({
                url: d.url,
                _id: d._id ? d._id.toString() : new mongoose_1.default.Types.ObjectId().toString()
            }));
            // Add cover image if available
            const coverImageAsset = product.coverImageAssetId;
            if (coverImageAsset && coverImageAsset.cloudinary && coverImageAsset.cloudinary.secureUrl) {
                previewImages.unshift({
                    url: coverImageAsset.cloudinary.secureUrl,
                    _id: coverImageAsset._id ? coverImageAsset._id.toString() : new mongoose_1.default.Types.ObjectId().toString()
                });
            }
            return {
                ...product,
                description: product.description || '',
                previewImages,
                stats: {
                    assetCount: (product.deliverables || []).length
                }
            };
        });
        return res.json({ ok: true, products: transformedProducts });
    }
    catch (e) {
        console.log(e);
        res.status(500).json({
            ok: false,
            error: "Internal server error",
        });
    }
});
// Get Product Assets (Preview Images from ImageAsset collection)
exports.creatorProductRouter.get("/:productId/assets", async (req, res) => {
    try {
        const { productId } = req.params;
        // Validate productId
        if (!productId) {
            return res.status(400).json({
                ok: false,
                error: "Product ID is required",
            });
        }
        // Find the product
        const product = await Product_1.Product.findOne({
            _id: productId,
            creatorId: req.user.id,
        });
        if (!product) {
            return res.status(404).json({
                ok: false,
                error: "Product not found",
            });
        }
        // Get preview images from ImageAsset collection (NOT from deliverables)
        const imageAssets = await ImageAsset_1.ImageAsset.find({
            productId: product._id
        }).sort({ createdAt: -1 });
        // Convert ImageAsset documents to asset format for frontend
        const assets = imageAssets.map((asset) => ({
            _id: asset._id,
            cloudinary: {
                secureUrl: asset.cloudinary.secureUrl,
                publicId: asset.cloudinary.publicId,
            },
            createdAt: asset.createdAt,
            updatedAt: asset.updatedAt,
        }));
        return res.json({
            ok: true,
            assets: assets
        });
    }
    catch (e) {
        console.error("Failed to fetch product assets:", e);
        res.status(500).json({
            ok: false,
            error: "Failed to fetch product assets",
        });
    }
});
// Upload File for Deliverables using Cloudinary
const multer_1 = __importDefault(require("multer"));
const cloudinary_1 = require("../lib/cloudinary");
const cloudinary_2 = require("cloudinary");
const upload = (0, multer_1.default)({ storage: multer_1.default.memoryStorage() });
exports.creatorProductRouter.post("/:productId/upload-file", upload.single("file"), async (req, res) => {
    try {
        const { productId } = req.params;
        if (!productId) {
            return res.status(400).json({
                ok: false,
                error: "Product ID is required",
            });
        }
        // Find the product
        const product = await Product_1.Product.findOne({
            _id: productId,
            creatorId: req.user.id,
        });
        if (!product) {
            return res.status(404).json({
                ok: false,
                error: "Product not found",
            });
        }
        // Check if file was uploaded
        if (!req.file) {
            return res.status(400).json({
                ok: false,
                error: "No file uploaded",
            });
        }
        // Upload to Cloudinary
        const fileNameNoExt = req.file.originalname.replace(/\.[^/.]+$/, "");
        const folder = `products/${productId}/files`;
        const result = await (0, cloudinary_1.uploadFileBufferToCloudinary)({
            buffer: req.file.buffer,
            folder,
            fileNameNoExt: `${Date.now()}-${fileNameNoExt}`,
            resourceType: "raw", // Use raw for non-image files
        });
        return res.json({
            ok: true,
            fileUrl: result.secureUrl,
            publicId: result.publicId,
            message: "File uploaded successfully"
        });
    }
    catch (e) {
        console.error("Failed to upload file:", e);
        res.status(500).json({
            ok: false,
            error: "Failed to upload file",
        });
    }
});
// Add Asset to Product (for Google Images import)
exports.creatorProductRouter.post("/assets", async (req, res) => {
    try {
        const { productId, sourceUrl, assetType } = req.body;
        if (!productId || !sourceUrl) {
            return res.status(400).json({
                ok: false,
                error: "Product ID and source URL are required",
            });
        }
        // Find product
        const product = await Product_1.Product.findOne({
            _id: productId,
            creatorId: req.user.id,
        });
        if (!product) {
            return res.status(404).json({
                ok: false,
                error: "Product not found",
            });
        }
        // Create a new asset
        const newAsset = {
            _id: new mongoose_1.default.Types.ObjectId(),
            cloudinary: {
                secureUrl: sourceUrl,
                publicId: `google-image-${Date.now()}`,
            },
            createdAt: new Date(),
            updatedAt: new Date(),
        };
        // Add the asset to ImageAsset collection
        const savedAsset = await ImageAsset_1.ImageAsset.create({
            productId: product._id,
            creatorId: req.user.id,
            source: {
                sourceUrl,
                sourcePageUrl: sourceUrl,
            },
            cloudinary: {
                secureUrl: sourceUrl,
                publicId: `google-image-${Date.now()}`,
                folder: `products/${product._id}`,
            },
            meta: {
                filename: `google-image-${Date.now()}`,
                contentType: "image/jpeg",
                sizeBytes: 0, // Would be calculated from actual upload
                width: 800, // Would be calculated from actual upload
                height: 600, // Would be calculated from actual upload
            },
            orderIndex: 0,
        });
        console.log("Saved asset to database:", savedAsset._id);
        // Images should be preview images only - NOT added to deliverables
        // They are stored in ImageAsset collection and shown in Preview Images section
        await product.save();
        return res.json({
            ok: true,
            asset: savedAsset,
            message: "Asset added successfully"
        });
    }
    catch (e) {
        console.error("Failed to add asset:", e);
        res.status(500).json({
            ok: false,
            error: "Failed to add asset",
        });
    }
});
// Real Image Upload Route
exports.creatorProductRouter.post("/:productId/upload-image", async (req, res) => {
    try {
        const { productId } = req.params;
        if (!productId) {
            return res.status(400).json({
                ok: false,
                error: "Product ID is required",
            });
        }
        // Find product
        const product = await Product_1.Product.findOne({
            _id: productId,
            creatorId: req.user.id,
        });
        if (!product) {
            return res.status(404).json({
                ok: false,
                error: "Product not found",
            });
        }
        // This would handle multipart/form-data upload
        // For now, we'll create a simple URL-based upload
        const { imageUrl, assetType = "preview" } = req.body;
        if (!imageUrl) {
            return res.status(400).json({
                ok: false,
                error: "Image URL is required",
            });
        }
        // Create a new asset
        const newAsset = await ImageAsset_1.ImageAsset.create({
            productId: product._id,
            creatorId: req.user.id,
            source: {
                sourceUrl: imageUrl,
                sourcePageUrl: imageUrl,
            },
            cloudinary: {
                secureUrl: imageUrl,
                publicId: `uploaded-image-${Date.now()}`,
                folder: `products/${product._id}`,
            },
            meta: {
                filename: `uploaded-image-${Date.now()}`,
                contentType: "image/jpeg",
                sizeBytes: 0,
                width: 800,
                height: 600,
            },
            orderIndex: 0,
        });
        console.log("Saved real asset to database:", newAsset._id);
        // Images should be preview images only - NOT added to deliverables
        // They are stored in ImageAsset collection and shown in Preview Images section
        // Set as cover image if no cover exists
        if (!product.coverImageAssetId) {
            product.coverImageAssetId = newAsset._id;
        }
        await product.save();
        return res.json({
            ok: true,
            asset: newAsset,
            message: "Image uploaded successfully"
        });
    }
    catch (e) {
        console.error("Failed to upload image:", e);
        res.status(500).json({
            ok: false,
            error: "Failed to upload image",
        });
    }
});
// Upload Image File directly to Cloudinary
exports.creatorProductRouter.post("/:productId/upload-image-file", upload.single("file"), async (req, res) => {
    try {
        const { productId } = req.params;
        if (!productId) {
            return res.status(400).json({
                ok: false,
                error: "Product ID is required",
            });
        }
        // Find product
        const product = await Product_1.Product.findOne({
            _id: productId,
            creatorId: req.user.id,
        });
        if (!product) {
            return res.status(404).json({
                ok: false,
                error: "Product not found",
            });
        }
        // Check if file was uploaded
        if (!req.file) {
            return res.status(400).json({
                ok: false,
                error: "No file uploaded",
            });
        }
        // Validate file type
        if (!req.file.mimetype.startsWith('image/')) {
            return res.status(400).json({
                ok: false,
                error: "Only image files are allowed",
            });
        }
        // Upload to Cloudinary as image
        const fileNameNoExt = req.file.originalname.replace(/\.[^/.]+$/, "");
        const folder = `products/${productId}/images`;
        const result = await (0, cloudinary_1.uploadFileBufferToCloudinary)({
            buffer: req.file.buffer,
            folder,
            fileNameNoExt: `${Date.now()}-${fileNameNoExt}`,
            resourceType: "image",
        });
        // Create ImageAsset record
        const newAsset = await ImageAsset_1.ImageAsset.create({
            productId: product._id,
            creatorId: req.user.id,
            source: {
                sourceUrl: result.secureUrl,
                sourcePageUrl: result.secureUrl,
            },
            cloudinary: {
                secureUrl: result.secureUrl,
                publicId: result.publicId,
                folder: folder,
            },
            meta: {
                filename: req.file.originalname,
                contentType: req.file.mimetype,
                sizeBytes: req.file.size,
                width: 800, // Would need to get actual dimensions
                height: 600,
            },
            orderIndex: 0,
        });
        // Set as cover image if no cover exists
        if (!product.coverImageAssetId) {
            product.coverImageAssetId = newAsset._id;
            await product.save();
        }
        return res.json({
            ok: true,
            asset: newAsset,
            secureUrl: result.secureUrl,
            message: "Image uploaded successfully"
        });
    }
    catch (e) {
        console.error("Failed to upload image file:", e);
        res.status(500).json({
            ok: false,
            error: "Failed to upload image file",
        });
    }
});
// Set Cover Image
exports.creatorProductRouter.patch("/:productId/cover", async (req, res) => {
    try {
        const { productId } = req.params;
        const { imageAssetId } = req.body;
        if (!productId || !imageAssetId) {
            return res.status(400).json({
                ok: false,
                error: "Product ID and image asset ID are required",
            });
        }
        // Find the product
        const product = await Product_1.Product.findOne({
            _id: productId,
            creatorId: req.user.id,
        });
        if (!product) {
            return res.status(404).json({
                ok: false,
                error: "Product not found",
            });
        }
        // Update the cover image asset ID
        product.coverImageAssetId = imageAssetId;
        await product.save();
        return res.json({
            ok: true,
            product: product,
            message: "Cover image updated successfully"
        });
    }
    catch (e) {
        console.error("Failed to set cover image:", e);
        res.status(500).json({
            ok: false,
            error: "Failed to set cover image",
        });
    }
});
// Delete Asset
exports.creatorProductRouter.delete("/:productId/assets/:assetId", async (req, res) => {
    try {
        const { productId, assetId } = req.params;
        if (!productId || !assetId) {
            return res.status(400).json({
                ok: false,
                error: "Product ID and asset ID are required",
            });
        }
        // Find the product
        const product = await Product_1.Product.findOne({
            _id: productId,
            creatorId: req.user.id,
        });
        if (!product) {
            return res.status(404).json({
                ok: false,
                error: "Product not found",
            });
        }
        // First, find and delete the ImageAsset
        const imageAsset = await ImageAsset_1.ImageAsset.findOne({
            _id: assetId,
            productId: productId
        });
        if (!imageAsset) {
            return res.status(404).json({
                ok: false,
                error: "Asset not found",
            });
        }
        // Delete the Cloudinary image if it exists
        if (imageAsset.cloudinary?.publicId) {
            try {
                await cloudinary_2.v2.uploader.destroy(imageAsset.cloudinary.publicId);
            }
            catch (cloudinaryError) {
                console.error("Failed to delete Cloudinary image:", cloudinaryError);
                // Continue even if Cloudinary deletion fails
            }
        }
        // Delete the ImageAsset from database
        await ImageAsset_1.ImageAsset.findByIdAndDelete(assetId);
        // If the deleted asset was the cover image, remove the cover image reference
        if (product.coverImageAssetId && product.coverImageAssetId.toString() === assetId) {
            product.coverImageAssetId = null;
            await product.save();
        }
        return res.json({
            ok: true,
            message: "Asset deleted successfully"
        });
    }
    catch (e) {
        console.error("Failed to delete asset:", e);
        res.status(500).json({
            ok: false,
            error: "Failed to delete asset",
        });
    }
});
// Get single product
exports.creatorProductRouter.get("/:productId", async (req, res) => {
    try {
        const { productId } = req.params;
        // Validate productId
        if (!productId) {
            return res.status(400).json({
                ok: false,
                error: "Product ID is required",
            });
        }
        // TODO: Implement loadOwnProduct function
        // const { product } = await loadOwnProduct(req);
        // For now, let's find the product directly
        let product;
        try {
            product = await Product_1.Product.findOne({
                _id: productId,
                creatorId: req.user.id,
            });
        }
        catch (error) {
            console.error("Invalid productId format:", error);
            return res.status(400).json({
                ok: false,
                error: "Invalid product ID format",
            });
        }
        if (!product) {
            return res.status(404).json({
                ok: false,
                error: "Product not found",
            });
        }
        // Convert Mongoose document to plain object to ensure all nested data is included
        const productData = product.toObject({ getters: true, virtuals: false });
        return res.json({ ok: true, product: productData });
    }
    catch (e) {
        console.error("Failed to fetch product:", e);
        res.status(500).json({
            ok: false,
            error: "Failed to fetch product",
        });
    }
});
// Publish product
exports.creatorProductRouter.patch("/:productId/publish", async (req, res) => {
    try {
        const { productId } = req.params;
        // Validate productId
        if (!productId) {
            return res.status(400).json({
                ok: false,
                error: "Product ID is required",
            });
        }
        // Find the product
        let product;
        try {
            product = await Product_1.Product.findOne({
                _id: productId,
                creatorId: req.user.id,
            });
        }
        catch (error) {
            console.error("Invalid productId format:", error);
            return res.status(400).json({
                ok: false,
                error: "Invalid product ID format",
            });
        }
        if (!product) {
            return res.status(404).json({
                ok: false,
                error: "Product not found",
            });
        }
        // Update product to published status
        product.visibility = "published";
        await product.save();
        return res.json({
            ok: true,
            product: {
                ...product.toObject(),
                visibility: "published"
            }
        });
    }
    catch (e) {
        console.error("Failed to publish product:", e);
        res.status(500).json({
            ok: false,
            error: "Failed to publish product",
        });
    }
});

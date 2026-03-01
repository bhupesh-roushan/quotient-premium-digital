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
Object.defineProperty(exports, "__esModule", { value: true });
exports.libraryRouter = void 0;
const express_1 = require("express");
const requireAuth_1 = require("../middleware/requireAuth");
const mongoose_1 = __importStar(require("mongoose"));
const Order_1 = require("../models/Order");
const Product_1 = require("../models/Product");
const ImageAsset_1 = require("../models/ImageAsset");
/** Express router for buyer library endpoints — mounted at /api/library. All routes require auth. */
exports.libraryRouter = (0, express_1.Router)();
exports.libraryRouter.use(requireAuth_1.requireAuth);
/**
 * Transforms a Cloudinary secure URL into a force-download (attachment) URL
 * by injecting the fl_attachment flag into the /upload/ path segment.
 */
function toAttachmentUrl(secureUrl) {
    return secureUrl.includes("/upload/")
        ? secureUrl.replace("/upload/", "/upload/fl_attachment/")
        : secureUrl;
}
/**
 * GET /api/library  [protected]
 * Returns all paid orders for the authenticated buyer, joined with product
 * details and cover image via MongoDB aggregation. Sorted newest-first.
 */
exports.libraryRouter.get("/", async (req, res) => {
    try {
        const buyerId = new mongoose_1.Types.ObjectId(req.user.id);
        console.log(buyerId, "buyerIdbuyerIdbuyerId");
        const items = await Order_1.Order.aggregate([
            { $match: { buyerId, status: "paid" } },
            { $sort: { paidAt: -1, createdAt: -1 } },
            {
                $lookup: {
                    from: Product_1.Product.collection.name,
                    localField: "productId",
                    foreignField: "_id",
                    as: "p",
                },
            },
            {
                $unwind: "$p",
            },
            {
                $lookup: {
                    from: ImageAsset_1.ImageAsset.collection.name,
                    localField: "p.coverImageAssetId",
                    foreignField: "_id",
                    as: "coverImage",
                },
            },
            {
                $unwind: {
                    path: "$coverImage",
                    preserveNullAndEmptyArrays: true,
                },
            },
            {
                $project: {
                    _id: 0,
                    productId: { $toString: "$p._id" },
                    orderId: { $toString: "$_id" },
                    title: "$p.title",
                    price: "$p.price",
                    amount: 1,
                    currency: "$p.currency",
                    description: "$p.description",
                    category: "$p.category",
                    license: "$p.license",
                    visibility: "$p.visibility",
                    stats: "$p.stats",
                    paidAt: 1,
                    createdAt: 1,
                    coverImageUrl: "$coverImage.cloudinary.secureUrl",
                },
            },
        ]);
        return res.json({ ok: true, items });
    }
    catch (e) {
        console.log(e);
        res.status(500).json({
            ok: false,
            error: "Internal server error",
        });
    }
});
/**
 * GET /api/library/:productId/assets  [protected]
 * Returns all image assets for a purchased product, ordered by orderIndex.
 * Returns 400 if the user hasn't purchased the product.
 */
exports.libraryRouter.get("/:productId/assets", async (req, res) => {
    try {
        const buyerId = new mongoose_1.Types.ObjectId(req.user.id);
        const extractProductId = String(req.params.productId || "");
        if (!mongoose_1.default.isValidObjectId(extractProductId)) {
            return res.status(400).json({ ok: false, error: "Invalid product ID" });
        }
        const productId = new mongoose_1.Types.ObjectId(extractProductId);
        const paid = await Order_1.Order.exists({ buyerId, productId, status: "paid" });
        if (!paid) {
            return res
                .status(400)
                .json({ ok: false, error: "Product not purchased" });
        }
        const assets = await ImageAsset_1.ImageAsset.find({ productId })
            .sort({ orderIndex: 1 })
            .select({
            "cloudinary.secureUrl": 1,
            "meta.width": 1,
            "meta.height": 1,
            orderIndex: 1,
        })
            .lean();
        console.log(assets, "assets");
        return res.json({
            ok: true,
            assets: assets.map((asset) => ({
                _id: String(asset._id),
                secureUrl: asset.cloudinary.secureUrl,
                width: asset.meta.width,
                height: asset.meta.height,
                orderIndex: asset.orderIndex,
            })),
        });
    }
    catch (e) {
        console.log(e);
        res.status(500).json({
            ok: false,
            error: "Internal server error",
        });
    }
});
/**
 * GET /api/library/:productId/deliverables  [protected]
 * Returns the product's deliverables array and install instructions.
 * For code-template products, injects each code file as a data-URI deliverable.
 * Returns 400 if the user hasn't purchased the product.
 */
exports.libraryRouter.get("/:productId/deliverables", async (req, res) => {
    try {
        const buyerId = new mongoose_1.Types.ObjectId(req.user.id);
        const extractProductId = String(req.params.productId || "");
        if (!mongoose_1.default.isValidObjectId(extractProductId)) {
            return res.status(400).json({ ok: false, error: "Invalid product ID" });
        }
        const productId = new mongoose_1.Types.ObjectId(extractProductId);
        const paid = await Order_1.Order.exists({ buyerId, productId, status: "paid" });
        if (!paid) {
            return res
                .status(400)
                .json({ ok: false, error: "Product not purchased" });
        }
        const product = await Product_1.Product.findById(productId)
            .select({ deliverables: 1, installInstructions: 1, title: 1, codeTemplate: 1 })
            .lean();
        if (!product) {
            return res.status(404).json({ ok: false, error: "Product not found" });
        }
        const deliverables = product?.deliverables ?? [];
        const installInstructions = String(product?.installInstructions || "") || "";
        // Include code files as deliverables for code templates
        const codeTemplate = product?.codeTemplate;
        if (codeTemplate?.codeFiles?.length > 0) {
            codeTemplate.codeFiles.forEach((file) => {
                deliverables.push({
                    label: file.filename,
                    url: `data:text/plain;charset=utf-8,${encodeURIComponent(file.content)}`,
                    kind: "code",
                });
            });
        }
        return res.json({
            ok: true,
            deliverables,
            installInstructions,
            codeTemplate: product?.codeTemplate || null,
        });
    }
    catch (e) {
        console.log(e);
        res.status(500).json({
            ok: false,
            error: "Internal server error",
        });
    }
});
/**
 * GET /api/library/assets/:assetId/download  [protected]
 * Verifies the buyer has purchased the product this asset belongs to, then
 * redirects to the Cloudinary force-download URL (fl_attachment).
 */
exports.libraryRouter.get("/assets/:assetId/download", async (req, res) => {
    try {
        const buyerId = new mongoose_1.Types.ObjectId(req.user.id);
        const extractAssetId = String(req.params.assetId || "");
        console.log(buyerId, extractAssetId, "extractAssetId");
        if (!mongoose_1.default.isValidObjectId(extractAssetId)) {
            return res.status(400).json({ ok: false, error: "Invalid Asset ID" });
        }
        const asset = await ImageAsset_1.ImageAsset.findById(extractAssetId)
            .select({ productId: 1, "cloudinary.secureUrl": 1 })
            .lean();
        if (!asset) {
            return res.status(400).json({ ok: false, error: "Asset not found" });
        }
        const paid = await Order_1.Order.exists({
            buyerId,
            productId: asset.productId,
            status: "paid",
        });
        if (!paid) {
            return res.status(400).json({
                ok: false,
                error: "Asset not purchased! Please purchase it to access",
            });
        }
        return res.redirect(toAttachmentUrl(String(asset.cloudinary.secureUrl)));
    }
    catch (e) {
        console.log(e);
        res.status(500).json({
            ok: false,
            error: "Internal server error",
        });
    }
});

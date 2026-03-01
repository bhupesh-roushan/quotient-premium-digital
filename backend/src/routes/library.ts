import { Router } from "express";

import { AuthedRequest, requireAuth } from "../middleware/requireAuth";

import mongoose, { Types } from "mongoose";

import { Order } from "../models/Order";

import { Product } from "../models/Product";

import { ImageAsset } from "../models/ImageAsset";



/** Express router for buyer library endpoints — mounted at /api/library. All routes require auth. */
export const libraryRouter = Router();

libraryRouter.use(requireAuth);

/**
 * Transforms a Cloudinary secure URL into a force-download (attachment) URL
 * by injecting the fl_attachment flag into the /upload/ path segment.
 */
function toAttachmentUrl(secureUrl: string) {

  return secureUrl.includes("/upload/")

    ? secureUrl.replace("/upload/", "/upload/fl_attachment/")

    : secureUrl;

}



/**
 * GET /api/library  [protected]
 * Returns all paid orders for the authenticated buyer, joined with product
 * details and cover image via MongoDB aggregation. Sorted newest-first.
 */
libraryRouter.get("/", async (req: AuthedRequest, res) => {

  try {

    const buyerId = new Types.ObjectId(req.user!.id);



    console.log(buyerId, "buyerIdbuyerIdbuyerId");



    const items = await Order.aggregate([

      { $match: { buyerId, status: "paid" } },

      { $sort: { paidAt: -1, createdAt: -1 } },



      {

        $lookup: {

          from: Product.collection.name,

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

          from: ImageAsset.collection.name,

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

  } catch (e) {

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
libraryRouter.get("/:productId/assets", async (req: AuthedRequest, res) => {

  try {

    const buyerId = new Types.ObjectId(req.user!.id);

    const extractProductId = String(req.params.productId || "");



    if (!mongoose.isValidObjectId(extractProductId)) {

      return res.status(400).json({ ok: false, error: "Invalid product ID" });

    }



    const productId = new Types.ObjectId(extractProductId);



    const paid = await Order.exists({ buyerId, productId, status: "paid" });

    if (!paid) {

      return res

        .status(400)

        .json({ ok: false, error: "Product not purchased" });

    }



    const assets = await ImageAsset.find({ productId })

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

      assets: assets.map((asset: any) => ({

        _id: String(asset._id),

        secureUrl: asset.cloudinary.secureUrl,

        width: asset.meta.width,

        height: asset.meta.height,

        orderIndex: asset.orderIndex,

      })),

    });

  } catch (e) {

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
libraryRouter.get(

  "/:productId/deliverables",

  async (req: AuthedRequest, res) => {

    try {

      const buyerId = new Types.ObjectId(req.user!.id);

      const extractProductId = String(req.params.productId || "");



      if (!mongoose.isValidObjectId(extractProductId)) {

        return res.status(400).json({ ok: false, error: "Invalid product ID" });

      }



      const productId = new Types.ObjectId(extractProductId);



      const paid = await Order.exists({ buyerId, productId, status: "paid" });

      if (!paid) {

        return res

          .status(400)

          .json({ ok: false, error: "Product not purchased" });

      }



      const product = await Product.findById(productId)

        .select({ deliverables: 1, installInstructions: 1, title: 1, codeTemplate: 1 })

        .lean();



      if (!product) {

        return res.status(404).json({ ok: false, error: "Product not found" });

      }



      const deliverables = (product as any)?.deliverables ?? [];

      const installInstructions =

        String((product as any)?.installInstructions || "") || "";



      // Include code files as deliverables for code templates

      const codeTemplate = (product as any)?.codeTemplate;

      if (codeTemplate?.codeFiles?.length > 0) {

        codeTemplate.codeFiles.forEach((file: any) => {

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

        codeTemplate: (product as any)?.codeTemplate || null,

      });

    } catch (e) {

      console.log(e);

      res.status(500).json({

        ok: false,

        error: "Internal server error",

      });

    }

  }

);



/**
 * GET /api/library/assets/:assetId/download  [protected]
 * Verifies the buyer has purchased the product this asset belongs to, then
 * redirects to the Cloudinary force-download URL (fl_attachment).
 */
libraryRouter.get(

  "/assets/:assetId/download",

  async (req: AuthedRequest, res) => {

    try {

      const buyerId = new Types.ObjectId(req.user!.id);

      const extractAssetId = String(req.params.assetId || "");



      console.log(buyerId, extractAssetId, "extractAssetId");



      if (!mongoose.isValidObjectId(extractAssetId)) {

        return res.status(400).json({ ok: false, error: "Invalid Asset ID" });

      }



      const asset = await ImageAsset.findById(extractAssetId)

        .select({ productId: 1, "cloudinary.secureUrl": 1 })

        .lean();



      if (!asset) {

        return res.status(400).json({ ok: false, error: "Asset not found" });

      }



      const paid = await Order.exists({

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



      return res.redirect(

        toAttachmentUrl(String((asset as any).cloudinary.secureUrl))

      );

    } catch (e) {

      console.log(e);

      res.status(500).json({

        ok: false,

        error: "Internal server error",

      });

    }

  }

);


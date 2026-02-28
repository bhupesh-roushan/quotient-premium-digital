import { Router } from "express";

import { Product } from "../models/Product";

import { ImageAsset } from "../models/ImageAsset";



export const publicProductsRouter = Router();



publicProductsRouter.get("/", async (req, res) => {

  try {

    const products = await Product.aggregate([

      {

        $match: { visibility: "published" },

      },

      {

        $lookup: {

          from: ImageAsset.collection.name,

          localField: "_id",

          foreignField: "productId",

          as: "images",

        },

      },

      {

        $addFields: {

          coverUrl: {

            $ifNull: [
              {
                $let: {
                  vars: {
                    coverImage: {
                      $filter: {
                        input: "$images",
                        cond: { $eq: ["$$this._id", "$coverImageAssetId"] }
                      }
                    }
                  },
                  in: { $arrayElemAt: ["$$coverImage.cloudinary.secureUrl", 0] }
                }
              },
              null
            ]
          },

          allImageUrls: {
            $map: {
              input: "$images",
              as: "image",
              in: "$$image.cloudinary.secureUrl"
            }
          }
        },

      },

      {

        $project: {

          _id: 1,

          title: 1,

          description: 1,

          price: 1,

          slug: 1,

          creatorId: 1,

          coverUrl: 1,

          coverImageAssetId: 1,

          allImageUrls: 1,

          category: 1,

          stats: 1,

          tags: 1,

          createdAt: 1,

        },

      },

    ]);



    return res.json({ ok: true, products });

  } catch (e) {

    console.log("Error fetching products:", e);

    res.status(500).json({

      ok: false,

      error: "Internal server error",

    });

  }

});



publicProductsRouter.get("/:id", async (req, res) => {

  try {

    const slug = String(req.params.id || "").trim();

    console.log("Fetching product details for slug:", slug);



    if (!slug) {

      return res.status(400).json({

        ok: false,

        error: "Slug required",

      });

    }



    const products = await Product.aggregate([

      {

        $match: {

          slug,

          visibility: "published",

        },

      },

      {

        $lookup: {

          from: ImageAsset.collection.name,

          localField: "_id",

          foreignField: "productId",

          as: "images",

        },

      },

      {

        $addFields: {

          coverUrl: {

            $ifNull: [
              {
                $let: {
                  vars: {
                    coverImage: {
                      $filter: {
                        input: "$images",
                        cond: { $eq: ["$$this._id", "$coverImageAssetId"] }
                      }
                    }
                  },
                  in: { $arrayElemAt: ["$$coverImage.cloudinary.secureUrl", 0] }
                }
              },
              null
            ]
          },

          allImageUrls: {
            $map: {
              input: "$images",
              as: "image",
              in: "$$image.cloudinary.secureUrl"
            }
          }
        },

      },

      {

        $project: {

          _id: 1,

          title: 1,

          description: 1,

          price: 1,

          currency: 1,

          slug: 1,

          visibility: 1,

          stats: 1,

          coverImageAssetId: 1,

          creatorId: 1,

          coverUrl: 1,

          allImageUrls: 1,

          category: 1,

          features: 1,

          deliverables: 1,

          tags: 1,

          createdAt: 1,

          updatedAt: 1,

          codeTemplate: 1,

        },

      },

    ]);



    const product = products[0];

    console.log("Product found:", product ? "Yes" : "No");
    if (product) {
      console.log("Product coverUrl:", product.coverUrl);
      console.log("Product coverImageAssetId:", product.coverImageAssetId);
    }

    if (!product) {
      return res.status(404).json({ ok: false, error: "Product not found" });
    }

    // Increment view count
    try {
      await Product.findByIdAndUpdate(product._id, {
        $inc: { "stats.viewCount": 1 }
      });
      // Update the returned product with incremented view count
      product.stats.viewCount = (product.stats.viewCount || 0) + 1;
    } catch (updateError) {
      console.error("Failed to increment view count:", updateError);
      // Continue without failing the request
    }

    return res.json({
      ok: true,
      product,
    });

  } catch (e) {

    console.log("Error fetching product details:", e);

    res.status(500).json({

      ok: false,

      error: "Internal server error",

    });

  }

});

// Get all images for a product
publicProductsRouter.get("/:id/images", async (req, res) => {
  try {
    const slug = String(req.params.id || "").trim();
    
    console.log("Fetching images for product slug:", slug);

    if (!slug) {
      return res.status(400).json({
        ok: false,
        error: "Slug required",
      });
    }

    // First get the product
    const products = await Product.aggregate([
      {
        $match: {
          slug,
          visibility: "published",
        },
      },
      {
        $project: {
          _id: 1,
          title: 1,
          slug: 1,
        },
      },
    ]);

    const product = products[0];

    if (!product) {
      return res.status(404).json({ ok: false, error: "Product not found" });
    }

    // Get all images for this product
    const images = await ImageAsset.find({ productId: product._id })
      .sort({ orderIndex: 1, createdAt: -1 })
      .select({
        _id: 1,
        cloudinary: 1,
        meta: 1,
        orderIndex: 1,
        createdAt: 1,
      });

    console.log(`Found ${images.length} images for product ${product.title}`);

    return res.json({
      ok: true,
      product,
      images,
    });
  } catch (e) {
    console.log("Error fetching product images:", e);
    res.status(500).json({
      ok: false,
      error: "Internal server error",
    });
  }
});


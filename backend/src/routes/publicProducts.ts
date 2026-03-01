import { Router } from "express";

import { Product } from "../models/Product";

import { ImageAsset } from "../models/ImageAsset";

import { GoogleGenerativeAI } from "@google/generative-ai";



/** Express router for public (unauthenticated) product endpoints — mounted at /api/products */
export const publicProductsRouter = Router();

/**
 * GET /api/products
 * Returns all published products with their cover image URL and all image URLs
 * computed via MongoDB aggregation. Used by the buyer discover page.
 */
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



/**
 * GET /api/products/:id
 * Returns a single published product by slug or MongoDB ID, including
 * full product details, creator info, and all image URLs. Used by the
 * buyer product detail page.
 */
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

          aiPromptPack: 1,

          template: 1,

          developerBoilerplate: 1,

          workflowSystem: 1,

          automationGuide: 1,

          productivityFramework: 1,

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

    // Strip prompt content from aiPromptPack before sending to buyer (security)
    if (product.aiPromptPack?.prompts) {
      product.aiPromptPack = {
        ...product.aiPromptPack,
        prompts: product.aiPromptPack.prompts.map((p: any) => ({ label: p.label })),
      };
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

/**
 * GET /api/products/:id/images
 * Returns all ImageAsset documents for a product, ordered by orderIndex.
 * Used by the buyer image gallery page (/discover/[slug]/images).
 */
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

// POST /api/products/analyse — public Gemini-powered product insights (no auth required)
publicProductsRouter.post("/analyse", async (req, res) => {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) return res.status(500).json({ ok: false, error: "Gemini API not configured" });

    const { title, description, category, price, features, tags, stats, aiPromptPack } = req.body;
    if (!title) return res.status(400).json({ ok: false, error: "Product title is required" });

    const prompt = `You are a product analyst for a digital marketplace. Analyse this product and return ONLY a valid JSON object with no markdown, no code blocks, just raw JSON.

Product details:
- Title: ${title}
- Category: ${category || "digital product"}
- Price: ₹${price}
- Description: ${description || "N/A"}
- Features: ${features?.length ? features.join(", ") : "none listed"}
- Tags: ${tags?.length ? tags.join(", ") : "none"}
- Sales stats: ${stats ? `${stats.viewCount} views, ${stats.soldCount} sold, ${stats.averageRating?.toFixed(1) ?? "no"} avg rating (${stats.reviewCount} reviews)` : "no stats yet"}
${aiPromptPack?.prompts?.length ? `- AI Prompt Pack with ${aiPromptPack.prompts.length} prompts for models: ${aiPromptPack.supportedModels?.join(", ") || "general"}` : ""}

Return this exact JSON structure:
{
  "verdict": "Recommended" | "Good Value" | "Niche Pick" | "New Arrival",
  "summary": "2-3 sentence honest analysis of this product",
  "strengths": ["strength 1", "strength 2", "strength 3"],
  "considerations": ["consideration 1", "consideration 2"],
  "bestFor": ["audience 1", "audience 2", "audience 3"],
  "valueScore": <number 0-100>,
  "popularityScore": <number 0-100 based on stats>,
  "contentScore": <number 0-100 based on features and deliverables>
}`;

    const genAI = new GoogleGenerativeAI(apiKey);
    const MODELS = ["gemini-2.0-flash-lite", "gemini-2.0-flash", "gemini-2.5-flash"];
    let lastError: any;

    for (const modelName of MODELS) {
      try {
        const model = genAI.getGenerativeModel({
          model: modelName,
          generationConfig: {
            temperature: 0.4,
            maxOutputTokens: 4096,
            responseMimeType: "application/json",
          },
        });
        const result = await model.generateContent(prompt);
        let text = result.response.text().trim();
        // Strip markdown fences just in case
        text = text.replace(/^```json\s*/i, "").replace(/^```\s*/i, "").replace(/\s*```$/i, "").trim();
        // Extract first JSON object if extra text is present
        const start = text.indexOf("{");
        const end = text.lastIndexOf("}");
        if (start !== -1 && end !== -1) text = text.slice(start, end + 1);
        const insights = JSON.parse(text);
        return res.json({ ok: true, insights, model: modelName });
      } catch (err: any) {
        lastError = err;
        const msg = err?.message || "";
        if (msg.includes("429") || msg.includes("quota") || msg.includes("Too Many")) continue;
        if (err instanceof SyntaxError) continue; // try next model
        throw err;
      }
    }

    const isQuota = lastError?.message?.includes("429") || lastError?.message?.includes("quota");
    return res.status(isQuota ? 429 : 500).json({
      ok: false,
      error: isQuota ? "Gemini quota exhausted" : lastError?.message || "Unknown error",
    });
  } catch (e: any) {
    console.error("Product analyse error:", e);
    res.status(500).json({ ok: false, error: "Internal server error" });
  }
});


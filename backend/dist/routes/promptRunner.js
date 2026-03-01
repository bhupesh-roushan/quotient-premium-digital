"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.promptRunnerRouter = void 0;
const express_1 = require("express");
const requireAuth_1 = require("../middleware/requireAuth");
const generative_ai_1 = require("@google/generative-ai");
const Product_1 = require("../models/Product");
/** Express router for AI prompt execution endpoints — mounted at /api/prompt-runner. All routes require auth. */
exports.promptRunnerRouter = (0, express_1.Router)();
exports.promptRunnerRouter.use(requireAuth_1.requireAuth);
/**
 * Sends a prompt to Gemini with automatic model fallback.
 * Tries models in order: flash-lite → flash → 2.5-flash → flash-lite-latest.
 * Skips a model on 429 quota errors and tries the next; throws on other errors.
 * @param prompt - The raw prompt text to send
 * @param context - Optional product context prepended to the system instruction
 * @returns The generated text output and the model name that produced it
 */
async function runWithGemini(prompt, context) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey)
        throw new Error("Gemini API not configured");
    const genAI = new generative_ai_1.GoogleGenerativeAI(apiKey);
    const MODELS = ["gemini-2.0-flash-lite", "gemini-2.0-flash", "gemini-2.5-flash", "gemini-flash-lite-latest"];
    const systemContext = context
        ? `You are running a creator's AI prompt pack preview. Context: "${context}"\n\nRun this prompt:\n\n`
        : "You are previewing a creator's AI prompt pack. Run the following prompt and show a realistic, helpful response:\n\n";
    let lastError;
    for (const modelName of MODELS) {
        try {
            const model = genAI.getGenerativeModel({
                model: modelName,
                generationConfig: { temperature: 0.8, maxOutputTokens: 8192 },
            });
            const result = await model.generateContent(systemContext + prompt.trim());
            return { output: result.response.text(), model: modelName };
        }
        catch (err) {
            lastError = err;
            const msg = err?.message || "";
            if (msg.includes("429") || msg.includes("quota") || msg.includes("Too Many"))
                continue;
            throw err;
        }
    }
    const isQuota = lastError?.message?.includes("429") || lastError?.message?.includes("quota");
    const error = isQuota
        ? "Gemini API quota exhausted. Please update GEMINI_API_KEY."
        : `Gemini error: ${lastError?.message || "Unknown error"}`;
    throw Object.assign(new Error(error), { isQuota });
}
/**
 * POST /api/prompt-runner  [protected]
 * Runs a free-text prompt through Gemini. Used by creators to test custom prompts
 * in the product editor. Requires auth to prevent public abuse.
 */
exports.promptRunnerRouter.post("/", async (req, res) => {
    try {
        const { prompt, context } = req.body;
        if (!prompt || typeof prompt !== "string" || prompt.trim().length === 0)
            return res.status(400).json({ ok: false, error: "Prompt is required" });
        if (prompt.trim().length > 4000)
            return res.status(400).json({ ok: false, error: "Prompt too long (max 4000 chars)" });
        const { output, model } = await runWithGemini(prompt, context);
        return res.json({ ok: true, output, model });
    }
    catch (error) {
        const isQuota = error.isQuota;
        return res.status(isQuota ? 429 : 500).json({ ok: false, error: error.message });
    }
});
/**
 * POST /api/prompt-runner/product/:productId  [protected]
 * Runs a specific saved prompt from an AI Prompt Pack by its array index.
 * The actual prompt content is NEVER returned — only the generated output.
 * This prevents buyers from extracting the creator's prompt content.
 */
exports.promptRunnerRouter.post("/product/:productId", async (req, res) => {
    try {
        const { productId } = req.params;
        const { promptIndex, context } = req.body;
        if (promptIndex === undefined || typeof promptIndex !== "number")
            return res.status(400).json({ ok: false, error: "promptIndex is required" });
        const product = await Product_1.Product.findById(productId).select("aiPromptPack category").lean();
        if (!product)
            return res.status(404).json({ ok: false, error: "Product not found" });
        if (product.category !== "ai-prompt-pack")
            return res.status(400).json({ ok: false, error: "Not an AI prompt pack" });
        const prompts = product.aiPromptPack?.prompts ?? [];
        if (promptIndex < 0 || promptIndex >= prompts.length)
            return res.status(400).json({ ok: false, error: "Prompt not found" });
        const promptContent = prompts[promptIndex].content;
        if (!promptContent?.trim())
            return res.status(400).json({ ok: false, error: "Prompt has no content" });
        const { output, model } = await runWithGemini(promptContent, context);
        return res.json({ ok: true, output, model });
    }
    catch (error) {
        const isQuota = error.isQuota;
        return res.status(isQuota ? 429 : 500).json({ ok: false, error: error.message });
    }
});

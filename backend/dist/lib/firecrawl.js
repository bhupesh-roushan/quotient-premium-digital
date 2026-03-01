"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TEMPLATE_PAGE_SCHEMA = exports.PRODUCT_DESC_SCHEMA = void 0;
exports.getFirecrawl = getFirecrawl;
exports.firecrawlSearch = firecrawlSearch;
const firecrawl_js_1 = __importDefault(require("@mendable/firecrawl-js"));
function getFirecrawl() {
    const apiKey = process.env.FIRECRAWL_API_KEY;
    if (!apiKey)
        throw new Error("Firecrawl api kei is missing");
    return new firecrawl_js_1.default({ apiKey });
}
async function firecrawlSearch(args) {
    const apiKey = process.env.FIRECRAWL_API_KEY;
    const baseFirecrawlUri = process.env.FIRECRAWL_API_BASE_URL || "https://api.firecrawl.dev";
    if (!apiKey)
        throw new Error("Firecrawl api kei is missing");
    const response = await fetch(`${baseFirecrawlUri}/v2/search`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
            query: args.query,
            sources: ["web"],
            limit: args.limit,
        }),
    });
    if (!response.ok)
        throw new Error("Firecrawl search failed! Please try again...");
    const json = await response.json();
    const web = json?.data?.web ?? [];
    return web.map((r) => ({
        url: r.url,
        title: r.title,
        description: r.description,
    }));
}
exports.PRODUCT_DESC_SCHEMA = {
    type: "object",
    properties: {
        description: { type: "string" },
    },
    required: ["description"],
};
exports.TEMPLATE_PAGE_SCHEMA = {
    type: "object",
    properties: {
        summary: { type: "string" },
        sections: {
            type: "array",
            items: {
                type: "object",
                properties: {
                    heading: { type: "string" },
                    bullets: { type: "array", items: { type: "string" } },
                },
                required: ["heading", "bullets"],
            },
        },
        pricingTiers: {
            type: "array",
            items: {
                type: "object",
                properties: {
                    name: { type: "string" },
                    price: { type: "string" },
                    details: { type: "array", items: { type: "string" } },
                },
                required: ["name", "price", "details"],
            },
        },
    },
    required: ["summary", "sections", "pricingTiers"],
};

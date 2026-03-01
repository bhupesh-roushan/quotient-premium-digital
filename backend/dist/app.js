"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createApp = createApp;
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const ai_1 = require("./routes/ai");
const creatorProduct_1 = require("./routes/creatorProduct");
const creatorImport_1 = require("./routes/creatorImport");
const creatorSales_1 = require("./routes/creatorSales");
const creatorSalesSimple_1 = require("./routes/creatorSalesSimple");
const publicProducts_1 = require("./routes/publicProducts");
const review_1 = require("./routes/review");
const subscription_1 = require("./routes/subscription");
const admin_1 = require("./routes/admin");
const bulkImport_1 = require("./routes/bulkImport");
const serpapi_1 = require("./routes/serpapi");
const checkout_1 = require("./routes/checkout");
const auth_1 = require("./routes/auth");
const library_1 = require("./routes/library");
const user_1 = __importDefault(require("./routes/user"));
const promptRunner_1 = require("./routes/promptRunner");
/**
 * Creates and configures the Express application.
 * Registers all middleware (CORS, JSON body parsing, cookies) and mounts
 * every API router at its designated prefix. Returns the configured app
 * instance so server.ts can attach it to an HTTP server.
 */
function createApp() {
    const app = (0, express_1.default)();
    app.use((0, cors_1.default)({
        origin: [
            "https://quotient-premium-digital.vercel.app",
            "http://quotient-premium-digital.vercel.app",
            "http://localhost:3000",
            "https://localhost:3000"
        ],
        credentials: true,
    }));
    app.use(express_1.default.json({}));
    app.use((0, cookie_parser_1.default)());
    // ── Route registrations ──────────────────────────────────────────────────
    app.use("/api/auth", auth_1.authRouter); // register / login / logout / me
    app.use("/api/user", user_1.default);
    app.use("/api/subscriptions", subscription_1.subscriptionRouter);
    app.use("/api/creator/products", creatorProduct_1.creatorProductRouter);
    app.use("/api/creator/products", creatorImport_1.creatorImportRouter);
    app.use("/api/creator/sales", creatorSales_1.creatorSalesRouter);
    app.use("/api/creator/sales-simple", creatorSalesSimple_1.creatorSalesSimpleRouter);
    app.use("/api/products", publicProducts_1.publicProductsRouter);
    app.use("/api/checkout", checkout_1.checkoutRouter);
    app.use("/api/library", library_1.libraryRouter);
    app.use("/api/serpapi", serpapi_1.serpApiRouter);
    app.use("/api/ai", ai_1.aiRouter);
    app.use("/api/prompt-runner", promptRunner_1.promptRunnerRouter);
    app.use("/api/reviews", review_1.reviewRouter);
    app.use("/api/admin", admin_1.adminRouter);
    app.use("/api/bulk-import", bulkImport_1.bulkImportRouter);
    return app;
}

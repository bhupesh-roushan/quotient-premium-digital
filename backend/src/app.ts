import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { aiRouter } from "./routes/ai";
import { creatorProductRouter } from "./routes/creatorProduct";
import { creatorImportRouter } from "./routes/creatorImport";
import { creatorSalesRouter } from "./routes/creatorSales";
import { creatorSalesSimpleRouter } from "./routes/creatorSalesSimple";
import { publicProductsRouter } from "./routes/publicProducts";
import { reviewRouter } from "./routes/review";
import { subscriptionRouter } from "./routes/subscription";
import { adminRouter } from "./routes/admin";
import { bulkImportRouter } from "./routes/bulkImport";
import { serpApiRouter } from "./routes/serpapi";
import { requireAuth } from "./middleware/requireAuth";
import { checkoutRouter } from "./routes/checkout";
import { authRouter } from "./routes/auth";
import { libraryRouter } from "./routes/library";
import userRouter from "./routes/user";
import { promptRunnerRouter } from "./routes/promptRunner";

/**
 * Creates and configures the Express application.
 * Registers all middleware (CORS, JSON body parsing, cookies) and mounts
 * every API router at its designated prefix. Returns the configured app
 * instance so server.ts can attach it to an HTTP server.
 */
export function createApp() {

  const app = express();

  app.use(
    cors({
      origin: [
        "https://quotient-premium-digital.vercel.app",
        "http://quotient-premium-digital.vercel.app",
        "http://localhost:3000",
        "https://localhost:3000"
      ],
      credentials: true,
    })
  );

  app.use(express.json({}));

  app.use(cookieParser());

  // Debug middleware to log all requests
  app.use((req, res, next) => {
    console.log("=== EXPRESS REQUEST ===");
    console.log("Method:", req.method);
    console.log("URL:", req.url);
    console.log("Path:", req.path);
    console.log("Query:", req.query);
    next();
  });

  // ── Route registrations ──────────────────────────────────────────────────

  console.log("Registering auth routes at /api/auth");
  app.use("/api/auth", authRouter);         // register / login / logout / me

  app.use("/api/user", userRouter);

  app.use("/api/subscriptions", subscriptionRouter);

  app.use("/api/creator/products", creatorProductRouter);
  app.use("/api/creator/products", creatorImportRouter);

  app.use("/api/creator/sales", creatorSalesRouter);

  app.use("/api/creator/sales-simple", creatorSalesSimpleRouter);

  app.use("/api/products", publicProductsRouter);

  app.use("/api/checkout", checkoutRouter);

  app.use("/api/library", libraryRouter);

  app.use("/api/serpapi", serpApiRouter);

  app.use("/api/ai", aiRouter);

  app.use("/api/prompt-runner", promptRunnerRouter);

  app.use("/api/reviews", reviewRouter);

  app.use("/api/admin", adminRouter);

  app.use("/api/bulk-import", bulkImportRouter);

  return app;

}

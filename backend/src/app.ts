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

export function createApp() {

  const app = express();

  app.use(
    cors({
      origin: process.env.FRONTEND_ORIGIN,
      credentials: true,
    })
  );

  app.use(express.json({}));

  app.use(cookieParser());

  // all routes placeholder

  app.use("/api/auth", authRouter);

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

  app.use("/api/reviews", reviewRouter);

  app.use("/api/admin", adminRouter);

  app.use("/api/bulk-import", bulkImportRouter);

  return app;

}

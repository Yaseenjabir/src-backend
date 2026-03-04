import express, {
  type Request,
  type RequestHandler,
  type Response,
} from "express";
import cors from "cors";
import morgan from "morgan";
import helmet from "helmet";

import authRoutes from "./routes/auth.routes.ts";
import healthRoutes from "./routes/health.routes.ts";
import productRoutes from "./routes/product.routes.ts";
import customerRoutes from "./routes/customer.routes.ts";
import invoiceRoutes from "./routes/invoice.routes.ts";
import summaryRoutes from "./routes/summary.routes.ts";
import { errorHandler, notFoundHandler } from "./middlewares/errorHandler.ts";
import { requireAdmin } from "./middlewares/auth.middleware.ts";

const app = express();

const helmetMiddleware = helmet as unknown as () => RequestHandler;

app.use(helmetMiddleware());
app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

app.use("/api/v1/health", healthRoutes);
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/products", requireAdmin, productRoutes);
app.use("/api/v1/customers", requireAdmin, customerRoutes);
app.use("/api/v1/invoices", requireAdmin, invoiceRoutes);
app.use("/api/v1/summary", requireAdmin, summaryRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

export default app;

import express, { type Request, type Response } from "express";
import cors from "cors";
import morgan from "morgan";
import helmet from "helmet";

import healthRoutes from "./routes/health.routes.ts";
import productRoutes from "./routes/product.routes.ts";
import customerRoutes from "./routes/customer.routes.ts";
import { errorHandler, notFoundHandler } from "./middlewares/errorHandler.ts";

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

app.use("/api/v1/health", healthRoutes);
app.use("/api/v1/products", productRoutes);
app.use("/api/v1/customers", customerRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

export default app;

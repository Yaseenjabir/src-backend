import { Router } from "express";
import {
  createProduct,
  getProductCategories,
  listProducts,
} from "../controllers/product.controller.ts";
import { validateRequest } from "../middlewares/validateRequest.ts";
import { asyncHandler } from "../utils/asyncHandler.ts";
import {
  createProductBodySchema,
  listProductsQuerySchema,
} from "../validators/product.validator.ts";

const router = Router();

router.get("/categories", asyncHandler(getProductCategories));
router.get(
  "/",
  validateRequest(listProductsQuerySchema, "query"),
  asyncHandler(listProducts),
);
router.post(
  "/",
  validateRequest(createProductBodySchema),
  asyncHandler(createProduct),
);

export default router;

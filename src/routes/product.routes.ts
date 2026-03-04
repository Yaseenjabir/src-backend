import { Router } from "express";
import {
  createProduct,
  getProductCategories,
  listProducts,
} from "../controllers/product.controller.js";
import { validateRequest } from "../middlewares/validateRequest.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import {
  createProductBodySchema,
  listProductsQuerySchema,
} from "../validators/product.validator.js";

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

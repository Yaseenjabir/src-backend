import { Router } from "express";
import {
  createProduct,
  getProductCategories,
  listProducts,
} from "../controllers/product.controller.ts";
import { asyncHandler } from "../utils/asyncHandler.ts";

const router = Router();

router.get("/categories", asyncHandler(getProductCategories));
router.get("/", asyncHandler(listProducts));
router.post("/", asyncHandler(createProduct));

export default router;

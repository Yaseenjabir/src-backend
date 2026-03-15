import { Router } from "express";
import {
  createProductModel,
  deleteProductModel,
  listProductModels,
  updateProductModel,
} from "../controllers/productModel.controller.js";
import { validateRequest } from "../middlewares/validateRequest.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import {
  createProductModelBodySchema,
  productModelIdParamsSchema,
  updateProductModelBodySchema,
} from "../validators/productModel.validator.js";

const router = Router();

router.get("/", asyncHandler(listProductModels));
router.post(
  "/",
  validateRequest(createProductModelBodySchema),
  asyncHandler(createProductModel),
);
router.patch(
  "/:id",
  validateRequest(productModelIdParamsSchema, "params"),
  validateRequest(updateProductModelBodySchema),
  asyncHandler(updateProductModel),
);
router.delete(
  "/:id",
  validateRequest(productModelIdParamsSchema, "params"),
  asyncHandler(deleteProductModel),
);

export default router;

import { z } from "zod";
import { PRODUCT_MODELS } from "../constants/productCategories.js";

const objectIdSchema = z
  .string()
  .regex(/^[a-fA-F0-9]{24}$/, "Invalid ObjectId");

export const productIdParamsSchema = z.object({
  id: objectIdSchema,
});

export const createProductBodySchema = z.object({
  sku: z.string().trim().min(1).optional(),
  name: z.string().trim().min(2),
  model: z.enum(PRODUCT_MODELS),
  price: z.number().int().nonnegative(),
  is_active: z.boolean().optional(),
});

export const updateProductBodySchema = z
  .object({
    name: z.string().trim().min(2).optional(),
    model: z.enum(PRODUCT_MODELS).optional(),
    price: z.number().int().nonnegative().optional(),
    is_active: z.boolean().optional(),
  })
  .refine((value) => Object.keys(value).length > 0, {
    message: "At least one field is required",
  });

export const listProductsQuerySchema = z.object({
  q: z.string().trim().optional(),
  isActive: z.enum(["true", "false"]).optional(),
  page: z.string().regex(/^\d+$/).optional(),
  limit: z.string().regex(/^\d+$/).optional(),
});

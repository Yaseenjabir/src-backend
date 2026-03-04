import { z } from "zod";
import { PRODUCT_CATEGORIES } from "../constants/productCategories.js";

export const createProductBodySchema = z.object({
  sku: z.string().trim().min(1),
  name: z.string().trim().min(2),
  category: z.enum(PRODUCT_CATEGORIES),
  price: z.number().int().nonnegative(),
  is_active: z.boolean().optional(),
});

export const listProductsQuerySchema = z.object({
  category: z.enum(PRODUCT_CATEGORIES).optional(),
  q: z.string().trim().optional(),
  isActive: z.enum(["true", "false"]).optional(),
  page: z.string().regex(/^\d+$/).optional(),
  limit: z.string().regex(/^\d+$/).optional(),
});

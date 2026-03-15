import { z } from "zod";

const objectIdSchema = z
  .string()
  .regex(/^[a-fA-F0-9]{24}$/, "Invalid ObjectId");

export const productModelIdParamsSchema = z.object({
  id: objectIdSchema,
});

export const createProductModelBodySchema = z.object({
  label: z.string().trim().min(1),
});

export const updateProductModelBodySchema = z.object({
  label: z.string().trim().min(1),
});

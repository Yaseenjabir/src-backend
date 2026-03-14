import { z } from "zod";

const objectIdSchema = z
  .string()
  .regex(/^[a-fA-F0-9]{24}$/, "Invalid ObjectId");

const dateStringSchema = z
  .string()
  .refine((value) => !Number.isNaN(new Date(value).getTime()), "Invalid date");

export const listPaymentsQuerySchema = z.object({
  invoiceId: objectIdSchema.optional(),
  method: z.enum(["CASH", "BANK", "OTHER"]).optional(),
  fromDate: dateStringSchema.optional(),
  toDate: dateStringSchema.optional(),
  page: z.string().regex(/^\d+$/).optional(),
  limit: z.string().regex(/^\d+$/).optional(),
});

export const createPaymentBodySchema = z.object({
  invoiceId: objectIdSchema,
  paymentDate: dateStringSchema,
  amount: z.number().int().positive(),
  method: z.enum(["CASH", "BANK", "OTHER"]).optional(),
  reference: z.string().trim().optional(),
  notes: z.string().trim().optional(),
});

export const paymentIdParamsSchema = z.object({
  id: objectIdSchema,
});

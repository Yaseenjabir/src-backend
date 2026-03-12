import { z } from "zod";

const objectIdSchema = z
  .string()
  .regex(/^[a-fA-F0-9]{24}$/, "Invalid ObjectId");

export const createLedgerPaymentBodySchema = z.object({
  amount: z.number().int().min(1),
  method: z.enum(["CASH", "BANK", "OTHER"]),
  paymentDate: z.string().datetime().optional(),
  notes: z.string().trim().optional(),
});

export const listLedgerPaymentsQuerySchema = z.object({
  customerId: objectIdSchema.optional(),
  method: z.enum(["CASH", "BANK", "OTHER"]).optional(),
  page: z.string().regex(/^\d+$/).optional(),
  limit: z.string().regex(/^\d+$/).optional(),
});

export const ledgerPaymentIdParamsSchema = z.object({
  id: objectIdSchema,
});

export const customerIdParamsSchema = z.object({
  customerId: objectIdSchema,
});

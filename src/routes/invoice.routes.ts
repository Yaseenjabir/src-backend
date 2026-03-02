import { Router } from "express";
import {
  addInvoicePayment,
  createInvoice,
  deletePayment,
  getInvoiceById,
  listInvoices,
  listInvoicePayments,
  updateInvoice,
} from "../controllers/invoice.controller.ts";
import { validateRequest } from "../middlewares/validateRequest.ts";
import { asyncHandler } from "../utils/asyncHandler.ts";
import {
  addInvoicePaymentBodySchema,
  createInvoiceBodySchema,
  invoiceIdParamsSchema,
  listInvoicesQuerySchema,
  paymentIdParamsSchema,
  updateInvoiceBodySchema,
} from "../validators/invoice.validator.ts";

const router = Router();

router.get(
  "/",
  validateRequest(listInvoicesQuerySchema, "query"),
  asyncHandler(listInvoices),
);
router.post(
  "/",
  validateRequest(createInvoiceBodySchema),
  asyncHandler(createInvoice),
);
router.get(
  "/:id",
  validateRequest(invoiceIdParamsSchema, "params"),
  asyncHandler(getInvoiceById),
);
router.patch(
  "/:id",
  validateRequest(invoiceIdParamsSchema, "params"),
  validateRequest(updateInvoiceBodySchema),
  asyncHandler(updateInvoice),
);
router.post(
  "/:id/payments",
  validateRequest(invoiceIdParamsSchema, "params"),
  validateRequest(addInvoicePaymentBodySchema),
  asyncHandler(addInvoicePayment),
);
router.get(
  "/:id/payments",
  validateRequest(invoiceIdParamsSchema, "params"),
  asyncHandler(listInvoicePayments),
);
router.delete(
  "/payments/:paymentId",
  validateRequest(paymentIdParamsSchema, "params"),
  asyncHandler(deletePayment),
);

export default router;

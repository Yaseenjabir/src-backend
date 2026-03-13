import { Router } from "express";
import {
  addInvoicePayment,
  appendInvoiceItems,
  createInvoice,
  deleteInvoice,
  deletePayment,
  getInvoiceById,
  listInvoices,
  listInvoicePayments,
  updateInvoice,
} from "../controllers/invoice.controller.js";
import { validateRequest } from "../middlewares/validateRequest.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import {
  addInvoicePaymentBodySchema,
  appendItemsBodySchema,
  createInvoiceBodySchema,
  invoiceIdParamsSchema,
  listInvoicesQuerySchema,
  paymentIdParamsSchema,
  updateInvoiceBodySchema,
} from "../validators/invoice.validator.js";

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
router.delete(
  "/:id",
  validateRequest(invoiceIdParamsSchema, "params"),
  asyncHandler(deleteInvoice),
);
router.post(
  "/:id/items",
  validateRequest(invoiceIdParamsSchema, "params"),
  validateRequest(appendItemsBodySchema),
  asyncHandler(appendInvoiceItems),
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

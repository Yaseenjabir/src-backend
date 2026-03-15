import { Router } from "express";
import {
  appendInvoiceItems,
  createInvoice,
  deleteInvoice,
  getInvoiceById,
  listInvoices,
  updateInvoice,
} from "../controllers/invoice.controller.js";
import { validateRequest } from "../middlewares/validateRequest.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import {
  appendItemsBodySchema,
  createInvoiceBodySchema,
  invoiceIdParamsSchema,
  listInvoicesQuerySchema,
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
export default router;

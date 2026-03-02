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
import { asyncHandler } from "../utils/asyncHandler.ts";

const router = Router();

router.get("/", asyncHandler(listInvoices));
router.post("/", asyncHandler(createInvoice));
router.get("/:id", asyncHandler(getInvoiceById));
router.patch("/:id", asyncHandler(updateInvoice));
router.post("/:id/payments", asyncHandler(addInvoicePayment));
router.get("/:id/payments", asyncHandler(listInvoicePayments));
router.delete("/payments/:paymentId", asyncHandler(deletePayment));

export default router;

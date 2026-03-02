import { Router } from "express";
import {
  createInvoice,
  getInvoiceById,
  listInvoices,
  updateInvoice,
} from "../controllers/invoice.controller.ts";
import { asyncHandler } from "../utils/asyncHandler.ts";

const router = Router();

router.get("/", asyncHandler(listInvoices));
router.post("/", asyncHandler(createInvoice));
router.get("/:id", asyncHandler(getInvoiceById));
router.patch("/:id", asyncHandler(updateInvoice));

export default router;

import { Router } from "express";
import {
  listLedgerPayments,
  deleteLedgerPayment,
} from "../controllers/ledgerPayment.controller.js";
import {
  listCustomerLedgerPayments,
  createLedgerPayment,
} from "../controllers/ledgerPayment.controller.js";
import { validateRequest } from "../middlewares/validateRequest.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import {
  createLedgerPaymentBodySchema,
  customerIdParamsSchema,
  ledgerPaymentIdParamsSchema,
  listLedgerPaymentsQuerySchema,
} from "../validators/ledgerPayment.validator.js";

const router = Router();

// GET /ledger-payments — list all (used by PaymentsScreen)
router.get(
  "/",
  validateRequest(listLedgerPaymentsQuerySchema, "query"),
  asyncHandler(listLedgerPayments),
);

// DELETE /ledger-payments/:id
router.delete(
  "/:id",
  validateRequest(ledgerPaymentIdParamsSchema, "params"),
  asyncHandler(deleteLedgerPayment),
);

export default router;

// Customer-scoped routes — mounted under /customers/:customerId/ledger-payments
export const customerLedgerPaymentRouter = Router({ mergeParams: true });

customerLedgerPaymentRouter.get(
  "/",
  validateRequest(customerIdParamsSchema, "params"),
  asyncHandler(listCustomerLedgerPayments),
);
customerLedgerPaymentRouter.post(
  "/",
  validateRequest(customerIdParamsSchema, "params"),
  validateRequest(createLedgerPaymentBodySchema),
  asyncHandler(createLedgerPayment),
);

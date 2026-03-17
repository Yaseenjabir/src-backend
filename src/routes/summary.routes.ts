import { Router } from "express";
import { getDashboardSummary, getLedgerSummary, getOutstandingCustomers } from "../controllers/summary.controller.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const router = Router();

router.get("/dashboard", asyncHandler(getDashboardSummary));
router.get("/ledger", asyncHandler(getLedgerSummary));
router.get("/outstanding-customers", asyncHandler(getOutstandingCustomers));

export default router;

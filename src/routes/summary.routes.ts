import { Router } from "express";
import { getDashboardSummary, getLedgerSummary } from "../controllers/summary.controller.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const router = Router();

router.get("/dashboard", asyncHandler(getDashboardSummary));
router.get("/ledger", asyncHandler(getLedgerSummary));

export default router;

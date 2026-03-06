import { Router } from "express";
import {
  getDashboardSummary,
  getReceivablesSummary,
} from "../controllers/summary.controller.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const router = Router();

router.get("/receivables", asyncHandler(getReceivablesSummary));
router.get("/dashboard", asyncHandler(getDashboardSummary));

export default router;

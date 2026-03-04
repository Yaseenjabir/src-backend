import { Router } from "express";
import { getReceivablesSummary } from "../controllers/summary.controller.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const router = Router();

router.get("/receivables", asyncHandler(getReceivablesSummary));

export default router;

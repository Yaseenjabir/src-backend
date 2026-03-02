import { Router } from "express";
import { getReceivablesSummary } from "../controllers/summary.controller.ts";
import { asyncHandler } from "../utils/asyncHandler.ts";

const router = Router();

router.get("/receivables", asyncHandler(getReceivablesSummary));

export default router;

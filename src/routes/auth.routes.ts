import { Router } from "express";
import { getMe, login } from "../controllers/auth.controller.ts";
import { requireAdmin } from "../middlewares/auth.middleware.ts";
import { asyncHandler } from "../utils/asyncHandler.ts";

const router = Router();

router.post("/login", asyncHandler(login));
router.get("/me", requireAdmin, asyncHandler(getMe));

export default router;

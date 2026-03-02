import { Router } from "express";
import { getMe, login } from "../controllers/auth.controller.ts";
import { requireAdmin } from "../middlewares/auth.middleware.ts";
import { validateRequest } from "../middlewares/validateRequest.ts";
import { asyncHandler } from "../utils/asyncHandler.ts";
import { loginBodySchema } from "../validators/auth.validator.ts";

const router = Router();

router.post("/login", validateRequest(loginBodySchema), asyncHandler(login));
router.get("/me", requireAdmin, asyncHandler(getMe));

export default router;

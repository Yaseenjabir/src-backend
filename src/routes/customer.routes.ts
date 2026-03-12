import { Router } from "express";
import {
  createCustomer,
  deleteCustomer,
  getCustomerById,
  listCustomers,
  setOpeningBalance,
  updateCustomer,
} from "../controllers/customer.controller.js";
import { validateRequest } from "../middlewares/validateRequest.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import {
  createCustomerBodySchema,
  customerIdParamsSchema,
  listCustomersQuerySchema,
  openingBalanceBodySchema,
  updateCustomerBodySchema,
} from "../validators/customer.validator.js";

const router = Router();

router.get(
  "/",
  validateRequest(listCustomersQuerySchema, "query"),
  asyncHandler(listCustomers),
);
router.post(
  "/",
  validateRequest(createCustomerBodySchema),
  asyncHandler(createCustomer),
);
router.get(
  "/:id",
  validateRequest(customerIdParamsSchema, "params"),
  asyncHandler(getCustomerById),
);
router.patch(
  "/:id",
  validateRequest(customerIdParamsSchema, "params"),
  validateRequest(updateCustomerBodySchema),
  asyncHandler(updateCustomer),
);
router.patch(
  "/:id/opening-balance",
  validateRequest(customerIdParamsSchema, "params"),
  validateRequest(openingBalanceBodySchema),
  asyncHandler(setOpeningBalance),
);
router.delete(
  "/:id",
  validateRequest(customerIdParamsSchema, "params"),
  asyncHandler(deleteCustomer),
);

export default router;

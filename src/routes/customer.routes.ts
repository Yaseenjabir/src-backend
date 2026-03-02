import { Router } from "express";
import {
  createCustomer,
  deleteCustomer,
  getCustomerById,
  listCustomers,
  updateCustomer,
} from "../controllers/customer.controller.ts";
import { validateRequest } from "../middlewares/validateRequest.ts";
import { asyncHandler } from "../utils/asyncHandler.ts";
import {
  createCustomerBodySchema,
  customerIdParamsSchema,
  listCustomersQuerySchema,
  updateCustomerBodySchema,
} from "../validators/customer.validator.ts";

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
router.delete(
  "/:id",
  validateRequest(customerIdParamsSchema, "params"),
  asyncHandler(deleteCustomer),
);

export default router;

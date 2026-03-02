import { Router } from "express";
import {
  createCustomer,
  deleteCustomer,
  getCustomerById,
  listCustomers,
  updateCustomer,
} from "../controllers/customer.controller.ts";
import { asyncHandler } from "../utils/asyncHandler.ts";

const router = Router();

router.get("/", asyncHandler(listCustomers));
router.post("/", asyncHandler(createCustomer));
router.get("/:id", asyncHandler(getCustomerById));
router.patch("/:id", asyncHandler(updateCustomer));
router.delete("/:id", asyncHandler(deleteCustomer));

export default router;

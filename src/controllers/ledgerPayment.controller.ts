import type { Request, Response } from "express";
import mongoose from "mongoose";
import LedgerPayment from "../models/LedgerPayment.js";
import Customer from "../models/Customer.js";
import { AppError } from "../utils/AppError.js";

export async function listLedgerPayments(req: Request, res: Response) {
  const { customerId, method, page = "1", limit = "20" } = req.query;

  const filter: Record<string, unknown> = {};

  if (typeof customerId === "string" && customerId.trim()) {
    filter.customer_id = new mongoose.Types.ObjectId(customerId);
  }
  if (typeof method === "string" && ["CASH", "BANK", "OTHER"].includes(method)) {
    filter.method = method;
  }

  const pageNum = Math.max(parseInt(String(page), 10) || 1, 1);
  const limitNum = Math.min(Math.max(parseInt(String(limit), 10) || 20, 1), 100);

  const [items, total] = await Promise.all([
    LedgerPayment.find(filter)
      .populate("customer_id", "name shop_name")
      .sort({ payment_date: -1, created_at: -1 })
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum),
    LedgerPayment.countDocuments(filter),
  ]);

  return res.json({
    items,
    pagination: {
      page: pageNum,
      limit: limitNum,
      total,
      totalPages: Math.ceil(total / limitNum),
    },
  });
}

export async function listCustomerLedgerPayments(req: Request, res: Response) {
  const { customerId } = req.params;

  const customer = await Customer.findById(customerId);
  if (!customer) {
    throw new AppError(404, "NOT_FOUND", "Customer not found");
  }

  const payments = await LedgerPayment.find({ customer_id: customerId }).sort({
    payment_date: 1,
    created_at: 1,
  });

  return res.json(payments);
}

export async function createLedgerPayment(req: Request, res: Response) {
  const { customerId } = req.params;
  const { amount, method, paymentDate, notes } = req.body as {
    amount: number;
    method: string;
    paymentDate?: string;
    notes?: string;
  };

  const customer = await Customer.findById(customerId);
  if (!customer) {
    throw new AppError(404, "NOT_FOUND", "Customer not found");
  }

  const payment = await LedgerPayment.create({
    customer_id: customerId,
    payment_date: paymentDate ? new Date(paymentDate) : new Date(),
    amount,
    method,
    notes,
  });

  return res.status(201).json(payment);
}

export async function deleteLedgerPayment(req: Request, res: Response) {
  const { id } = req.params;

  if (!mongoose.isValidObjectId(id)) {
    throw new AppError(400, "BAD_REQUEST", "Invalid payment id");
  }

  const payment = await LedgerPayment.findByIdAndDelete(id);
  if (!payment) {
    throw new AppError(404, "NOT_FOUND", "Payment not found");
  }

  return res.json({ message: "Payment deleted successfully" });
}

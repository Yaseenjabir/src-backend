import type { Request, Response } from "express";
import mongoose from "mongoose";
import Customer from "../models/Customer.ts";
import Invoice from "../models/Invoice.ts";
import Payment from "../models/Payment.ts";
import Product from "../models/Product.ts";
import {
  INVOICE_STATUS,
  type InvoiceStatus,
} from "../constants/invoiceStatus.ts";
import { AppError } from "../utils/AppError.ts";

type InvoiceItemInput = {
  productId?: string;
  quantity?: number;
  unitPriceSnapshot?: number;
};

function assertValidObjectId(id: string, fieldName: string): void {
  if (!mongoose.isValidObjectId(id)) {
    throw new AppError(400, "BAD_REQUEST", `Invalid ${fieldName}`);
  }
}

function assertInteger(value: unknown, fieldName: string): number {
  if (typeof value !== "number" || !Number.isInteger(value)) {
    throw new AppError(
      400,
      "BAD_REQUEST",
      `${fieldName} must be a whole integer`,
    );
  }
  return value;
}

function parseDate(value: unknown, fieldName: string): Date {
  if (typeof value !== "string" || !value) {
    throw new AppError(400, "BAD_REQUEST", `${fieldName} is required`);
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    throw new AppError(400, "BAD_REQUEST", `${fieldName} must be a valid date`);
  }

  return parsed;
}

function deriveStatus(totalAmount: number, paidAmount: number): InvoiceStatus {
  if (paidAmount <= 0) {
    return "unpaid";
  }
  if (paidAmount < totalAmount) {
    return "partial";
  }
  return "completed";
}

function generateInvoiceNo(): string {
  const stamp = Date.now();
  const random = Math.floor(Math.random() * 1000)
    .toString()
    .padStart(3, "0");
  return `INV-${stamp}-${random}`;
}

async function getInvoicePaidAmount(invoiceId: string): Promise<number> {
  const result = await Payment.aggregate([
    { $match: { invoice_id: new mongoose.Types.ObjectId(invoiceId) } },
    { $group: { _id: null, total: { $sum: "$amount" } } },
  ]);

  return result[0]?.total ?? 0;
}

async function buildInvoiceItems(itemsInput: InvoiceItemInput[]) {
  if (!Array.isArray(itemsInput) || itemsInput.length === 0) {
    throw new AppError(400, "BAD_REQUEST", "items must be a non-empty array");
  }

  const productIds = [
    ...new Set(itemsInput.map((item) => item.productId).filter(Boolean)),
  ] as string[];
  for (const productId of productIds) {
    assertValidObjectId(productId, "productId");
  }

  const products = await Product.find({
    _id: { $in: productIds },
    is_active: true,
  });

  const productMap = new Map(
    products.map((product) => [product._id.toString(), product]),
  );

  let subtotal = 0;

  const items = itemsInput.map((item, index) => {
    if (!item.productId) {
      throw new AppError(
        400,
        "BAD_REQUEST",
        `items[${index}].productId is required`,
      );
    }

    const product = productMap.get(item.productId);
    if (!product) {
      throw new AppError(
        404,
        "NOT_FOUND",
        `Product not found for items[${index}]`,
      );
    }

    const quantity = assertInteger(item.quantity, `items[${index}].quantity`);
    if (quantity <= 0) {
      throw new AppError(
        422,
        "UNPROCESSABLE_ENTITY",
        `items[${index}].quantity must be > 0`,
      );
    }

    const fallbackPrice = product.price;
    const unitPrice =
      item.unitPriceSnapshot !== undefined
        ? assertInteger(
            item.unitPriceSnapshot,
            `items[${index}].unitPriceSnapshot`,
          )
        : fallbackPrice;

    if (unitPrice < 0) {
      throw new AppError(
        422,
        "UNPROCESSABLE_ENTITY",
        `items[${index}].unitPriceSnapshot must be >= 0`,
      );
    }

    const lineTotal = quantity * unitPrice;
    subtotal += lineTotal;

    return {
      product_id: product._id,
      product_name_snapshot: product.name,
      sku_snapshot: product.sku,
      unit_price_snapshot: unitPrice,
      quantity,
      line_total: lineTotal,
    };
  });

  return { items, subtotal };
}

export async function createInvoice(req: Request, res: Response) {
  const {
    invoiceNo,
    customerId,
    invoiceDate,
    discount: discountInput = 0,
    notes,
    items,
  } = req.body as {
    invoiceNo?: string;
    customerId?: string;
    invoiceDate?: string;
    discount?: number;
    notes?: string;
    items?: InvoiceItemInput[];
  };

  if (!customerId) {
    throw new AppError(400, "BAD_REQUEST", "customerId is required");
  }
  assertValidObjectId(customerId, "customerId");

  const customer = await Customer.findOne({ _id: customerId, is_active: true });
  if (!customer) {
    throw new AppError(404, "NOT_FOUND", "Customer not found");
  }

  const parsedDate = parseDate(invoiceDate, "invoiceDate");

  const discount = assertInteger(discountInput, "discount");
  if (discount < 0) {
    throw new AppError(422, "UNPROCESSABLE_ENTITY", "discount must be >= 0");
  }

  const { items: snapshotItems, subtotal } = await buildInvoiceItems(
    items ?? [],
  );

  const totalAmount = subtotal - discount;
  if (totalAmount < 0) {
    throw new AppError(
      422,
      "UNPROCESSABLE_ENTITY",
      "discount cannot be greater than subtotal",
    );
  }

  const invoice = await Invoice.create({
    invoice_no: (invoiceNo?.trim() || generateInvoiceNo()).toUpperCase(),
    customer_id: customer._id,
    invoice_date: parsedDate,
    subtotal,
    discount,
    total_amount: totalAmount,
    paid_amount: 0,
    remaining_amount: totalAmount,
    status: "unpaid",
    notes,
    items: snapshotItems,
  });

  return res.status(201).json(invoice);
}

export async function listInvoices(req: Request, res: Response) {
  const {
    status,
    customerId,
    fromDate,
    toDate,
    page = "1",
    limit = "20",
  } = req.query;

  const filter: Record<string, unknown> = {};

  if (typeof status === "string" && status) {
    if (!INVOICE_STATUS.includes(status as InvoiceStatus)) {
      throw new AppError(400, "BAD_REQUEST", "Invalid status filter");
    }
    filter.status = status;
  }

  if (typeof customerId === "string" && customerId) {
    assertValidObjectId(customerId, "customerId");
    filter.customer_id = customerId;
  }

  if (typeof fromDate === "string" || typeof toDate === "string") {
    const dateFilter: Record<string, Date> = {};

    if (typeof fromDate === "string" && fromDate) {
      dateFilter.$gte = parseDate(fromDate, "fromDate");
    }
    if (typeof toDate === "string" && toDate) {
      dateFilter.$lte = parseDate(toDate, "toDate");
    }

    filter.invoice_date = dateFilter;
  }

  const pageNum = Math.max(parseInt(String(page), 10) || 1, 1);
  const limitNum = Math.min(
    Math.max(parseInt(String(limit), 10) || 20, 1),
    100,
  );

  const [items, total] = await Promise.all([
    Invoice.find(filter)
      .populate("customer_id", "name shop_name phone")
      .sort({ invoice_date: -1, created_at: -1 })
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum),
    Invoice.countDocuments(filter),
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

export async function getInvoiceById(req: Request, res: Response) {
  const { id } = req.params;
  assertValidObjectId(id, "invoice id");

  const invoice = await Invoice.findById(id).populate(
    "customer_id",
    "name shop_name phone",
  );
  if (!invoice) {
    throw new AppError(404, "NOT_FOUND", "Invoice not found");
  }

  return res.json(invoice);
}

export async function updateInvoice(req: Request, res: Response) {
  const { id } = req.params;
  assertValidObjectId(id, "invoice id");

  const existingInvoice = await Invoice.findById(id);
  if (!existingInvoice) {
    throw new AppError(404, "NOT_FOUND", "Invoice not found");
  }

  const {
    invoiceDate,
    discount: discountInput,
    notes,
    items,
  } = req.body as {
    invoiceDate?: string;
    discount?: number;
    notes?: string;
    items?: InvoiceItemInput[];
  };

  const updatePayload: Record<string, unknown> = {};

  if (invoiceDate !== undefined) {
    updatePayload.invoice_date = parseDate(invoiceDate, "invoiceDate");
  }

  if (notes !== undefined) {
    updatePayload.notes = notes;
  }

  let subtotal = existingInvoice.subtotal;
  let discount = existingInvoice.discount;

  if (items !== undefined) {
    const rebuilt = await buildInvoiceItems(items);
    subtotal = rebuilt.subtotal;
    updatePayload.items = rebuilt.items;
    updatePayload.subtotal = subtotal;
  }

  if (discountInput !== undefined) {
    const parsedDiscount = assertInteger(discountInput, "discount");
    if (parsedDiscount < 0) {
      throw new AppError(422, "UNPROCESSABLE_ENTITY", "discount must be >= 0");
    }
    discount = parsedDiscount;
    updatePayload.discount = discount;
  }

  const totalAmount = subtotal - discount;
  if (totalAmount < 0) {
    throw new AppError(
      422,
      "UNPROCESSABLE_ENTITY",
      "discount cannot be greater than subtotal",
    );
  }

  const paidAmount = await getInvoicePaidAmount(id);
  const remainingAmount = Math.max(totalAmount - paidAmount, 0);
  const status = deriveStatus(totalAmount, paidAmount);

  updatePayload.total_amount = totalAmount;
  updatePayload.paid_amount = paidAmount;
  updatePayload.remaining_amount = remainingAmount;
  updatePayload.status = status;

  const updatedInvoice = await Invoice.findByIdAndUpdate(id, updatePayload, {
    new: true,
    runValidators: true,
  }).populate("customer_id", "name shop_name phone");

  if (!updatedInvoice) {
    throw new AppError(404, "NOT_FOUND", "Invoice not found");
  }

  return res.json(updatedInvoice);
}

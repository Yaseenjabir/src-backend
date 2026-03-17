import type { Request, Response } from "express";
import Invoice from "../models/Invoice.js";
import LedgerPayment from "../models/LedgerPayment.js";
import Customer from "../models/Customer.js";
import { AppError } from "../utils/AppError.js";

function parseOptionalDate(
  value: unknown,
  fieldName: string,
): Date | undefined {
  if (value === undefined) return undefined;
  if (typeof value !== "string" || !value.trim()) {
    throw new AppError(400, "BAD_REQUEST", `${fieldName} must be a valid date`);
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    throw new AppError(400, "BAD_REQUEST", `${fieldName} must be a valid date`);
  }

  return parsed;
}

function startOfDay(date: Date): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

function endOfDay(date: Date): Date {
  const d = new Date(date);
  d.setHours(23, 59, 59, 999);
  return d;
}

function startOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1, 0, 0, 0, 0);
}

export async function getLedgerSummary(_req: Request, res: Response) {
  const result = await Customer.aggregate([
    {
      $lookup: {
        from: "invoices",
        let: { customerId: "$_id" },
        pipeline: [
          { $match: { $expr: { $eq: ["$customer_id", "$$customerId"] } } },
          { $group: { _id: null, total: { $sum: "$total_amount" } } },
        ],
        as: "invoice_agg",
      },
    },
    {
      $lookup: {
        from: "ledgerpayments",
        let: { customerId: "$_id" },
        pipeline: [
          { $match: { $expr: { $eq: ["$customer_id", "$$customerId"] } } },
          { $group: { _id: null, total: { $sum: "$amount" } } },
        ],
        as: "payment_agg",
      },
    },
    {
      $addFields: {
        total_invoiced: {
          $ifNull: [{ $arrayElemAt: ["$invoice_agg.total", 0] }, 0],
        },
        total_paid: {
          $ifNull: [{ $arrayElemAt: ["$payment_agg.total", 0] }, 0],
        },
      },
    },
    {
      $addFields: {
        outstanding: { $add: ["$opening_balance", "$total_invoiced"] },
      },
    },
    {
      $addFields: {
        remaining: {
          $max: [0, { $subtract: ["$outstanding", "$total_paid"] }],
        },
      },
    },
    {
      $group: {
        _id: null,
        total_receivable: { $sum: "$remaining" },
        total_paid: { $sum: "$total_paid" },
        total_outstanding: { $sum: "$outstanding" },
        customers_with_balance: {
          $sum: { $cond: [{ $gt: ["$remaining", 0] }, 1, 0] },
        },
      },
    },
  ]);

  const summary = result[0] ?? {
    total_receivable: 0,
    total_paid: 0,
    total_outstanding: 0,
    customers_with_balance: 0,
  };

  return res.json({
    total_receivable: summary.total_receivable,
    total_paid: summary.total_paid,
    total_outstanding: summary.total_outstanding,
    customers_with_balance: summary.customers_with_balance,
  });
}

export async function getDashboardSummary(req: Request, res: Response) {
  const { fromDate, toDate, overdueDays = "7" } = req.query;

  const now = new Date();
  const parsedFrom =
    parseOptionalDate(fromDate, "fromDate") ?? startOfMonth(now);
  const parsedTo = parseOptionalDate(toDate, "toDate") ?? endOfDay(now);

  if (parsedTo.getTime() < parsedFrom.getTime()) {
    throw new AppError(400, "BAD_REQUEST", "toDate must be after fromDate");
  }

  const overdueDaysNum = Math.min(
    Math.max(parseInt(String(overdueDays), 10) || 7, 1),
    3650,
  );

  const overdueCutoff = startOfDay(now);
  overdueCutoff.setDate(overdueCutoff.getDate() - overdueDaysNum);

  const [
    openSummary,
    collectedSummary,
    overdueSummary,
    topOverdue,
    recentInvoices,
  ] = await Promise.all([
    Invoice.aggregate([
      {
        $match: {
          status: { $in: ["unpaid", "partial"] },
          remaining_amount: { $gt: 0 },
        },
      },
      {
        $group: {
          _id: null,
          receivable: { $sum: "$remaining_amount" },
          partial_count: {
            $sum: {
              $cond: [{ $eq: ["$status", "partial"] }, 1, 0],
            },
          },
        },
      },
    ]),
    LedgerPayment.aggregate([
      {
        $match: {
          payment_date: {
            $gte: parsedFrom,
            $lte: parsedTo,
          },
        },
      },
      {
        $group: {
          _id: null,
          collected: { $sum: "$amount" },
        },
      },
    ]),
    Invoice.aggregate([
      {
        $match: {
          remaining_amount: { $gt: 0 },
          invoice_date: { $lt: overdueCutoff },
        },
      },
      {
        $group: {
          _id: null,
          overdue_amount: { $sum: "$remaining_amount" },
          customer_ids: { $addToSet: "$customer_id" },
        },
      },
      {
        $project: {
          _id: 0,
          overdue_amount: 1,
          overdue_customers: { $size: "$customer_ids" },
        },
      },
    ]),
    Invoice.aggregate([
      {
        $match: {
          remaining_amount: { $gt: 0 },
          invoice_date: { $lt: overdueCutoff },
        },
      },
      {
        $group: {
          _id: "$customer_id",
          overdue_amount: { $sum: "$remaining_amount" },
          oldest_invoice_date: { $min: "$invoice_date" },
          invoice_count: { $sum: 1 },
        },
      },
      { $sort: { overdue_amount: -1 } },
      { $limit: 1 },
      {
        $lookup: {
          from: "customers",
          localField: "_id",
          foreignField: "_id",
          as: "customer",
        },
      },
      {
        $unwind: {
          path: "$customer",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $project: {
          _id: 0,
          customer_id: "$_id",
          customer_name: "$customer.name",
          shop_name: "$customer.shop_name",
          overdue_amount: 1,
          oldest_invoice_date: 1,
          invoice_count: 1,
        },
      },
    ]),
    Invoice.find({})
      .populate("customer_id", "name shop_name phone")
      .sort({ invoice_date: -1, created_at: -1 })
      .limit(5)
      .select(
        "invoice_no customer_id invoice_date total_amount remaining_amount status",
      ),
  ]);

  const open = openSummary[0] ?? { receivable: 0, partial_count: 0 };
  const collected = collectedSummary[0]?.collected ?? 0;
  const overdue = overdueSummary[0] ?? {
    overdue_amount: 0,
    overdue_customers: 0,
  };

  return res.json({
    period: {
      from: parsedFrom.toISOString(),
      to: parsedTo.toISOString(),
    },
    overdue_days: overdueDaysNum,
    kpis: {
      receivable: open.receivable,
      collected,
      partial_count: open.partial_count,
      overdue_amount: overdue.overdue_amount,
      overdue_customers: overdue.overdue_customers,
    },
    top_overdue_customer: topOverdue[0] ?? null,
    recent_invoices: recentInvoices,
  });
}

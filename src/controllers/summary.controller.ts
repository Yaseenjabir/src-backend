import type { Request, Response } from "express";
import Invoice from "../models/Invoice.js";

export async function getReceivablesSummary(req: Request, res: Response) {
  const [customerWiseOutstanding, outstandingInvoices] = await Promise.all([
    Invoice.aggregate([
      {
        $match: {
          status: { $in: ["unpaid", "partial"] },
          remaining_amount: { $gt: 0 },
        },
      },
      {
        $group: {
          _id: "$customer_id",
          total_remaining: { $sum: "$remaining_amount" },
          invoice_count: { $sum: 1 },
        },
      },
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
          phone: "$customer.phone",
          total_remaining: 1,
          invoice_count: 1,
        },
      },
      { $sort: { total_remaining: -1 } },
    ]),
    Invoice.find({ status: { $in: ["unpaid", "partial"] } })
      .populate("customer_id", "name shop_name phone")
      .sort({ remaining_amount: -1, invoice_date: -1 })
      .select(
        "invoice_no customer_id invoice_date total_amount paid_amount remaining_amount status",
      ),
  ]);

  const totals = outstandingInvoices.reduce(
    (acc, invoice) => {
      acc.total_receivable += invoice.remaining_amount;
      if (invoice.status === "unpaid") acc.unpaid_count += 1;
      if (invoice.status === "partial") acc.partial_count += 1;
      return acc;
    },
    {
      total_receivable: 0,
      unpaid_count: 0,
      partial_count: 0,
      invoice_count: outstandingInvoices.length,
      customer_count: customerWiseOutstanding.length,
    },
  );

  return res.json({
    totals,
    customer_wise_outstanding: customerWiseOutstanding,
    outstanding_invoices: outstandingInvoices,
  });
}

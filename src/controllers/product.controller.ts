import type { Request, Response } from "express";
import Product from "../models/Product.ts";
import { PRODUCT_CATEGORIES } from "../constants/productCategories.ts";
import { AppError } from "../utils/AppError.ts";

export async function getProductCategories(req: Request, res: Response) {
  return res.json({ categories: PRODUCT_CATEGORIES });
}

export async function createProduct(req: Request, res: Response) {
  const payload = req.body;
  const product = await Product.create(payload);
  return res.status(201).json(product);
}

export async function listProducts(req: Request, res: Response) {
  const {
    category,
    q,
    isActive = "true",
    page = "1",
    limit = "20",
  } = req.query;

  const filter: Record<string, unknown> = {};

  if (typeof category === "string" && category) {
    if (
      !PRODUCT_CATEGORIES.includes(
        category as (typeof PRODUCT_CATEGORIES)[number],
      )
    ) {
      throw new AppError(400, "BAD_REQUEST", "Invalid category filter");
    }
    filter.category = category;
  }

  if (typeof q === "string" && q) {
    filter.name = { $regex: q, $options: "i" };
  }

  if (isActive === "true" || isActive === "false") {
    filter.is_active = isActive === "true";
  }

  const pageNum = Math.max(parseInt(String(page), 10) || 1, 1);
  const limitNum = Math.min(
    Math.max(parseInt(String(limit), 10) || 20, 1),
    100,
  );

  const [items, total] = await Promise.all([
    Product.find(filter)
      .sort({ created_at: -1 })
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum),
    Product.countDocuments(filter),
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

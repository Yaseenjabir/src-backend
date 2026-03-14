import type { Request, Response } from "express";
import mongoose from "mongoose";
import Product from "../models/Product.js";
import { PRODUCT_MODELS } from "../constants/productCategories.js";
import { AppError } from "../utils/AppError.js";

function assertValidObjectId(id: string): void {
  if (!mongoose.isValidObjectId(id)) {
    throw new AppError(400, "BAD_REQUEST", "Invalid product id");
  }
}

function modelPrefix(model: string): string {
  const map: Record<string, string> = {
    A_SERIES: "AS",
    K_SERIES: "KS",
    R_SERIES: "RS",
    UNIQUE_SERIES: "US",
  };
  return map[model] ?? "PR";
}

async function generateProductSku(model: string): Promise<string> {
  const prefix = modelPrefix(model);

  for (let attempt = 0; attempt < 10; attempt += 1) {
    const stamp = Date.now().toString().slice(-6);
    const rand = Math.floor(Math.random() * 1000)
      .toString()
      .padStart(3, "0");
    const candidate = `${prefix}-${stamp}${rand}`;

    const exists = await Product.exists({ sku: candidate });
    if (!exists) return candidate;
  }

  throw new AppError(
    500,
    "INTERNAL_SERVER_ERROR",
    "Unable to generate product sku",
  );
}

export async function getProductModels(req: Request, res: Response) {
  return res.json({ models: PRODUCT_MODELS });
}

export async function createProduct(req: Request, res: Response) {
  const payload = { ...req.body } as {
    sku?: string;
    name: string;
    model: string;
    price: number;
  };

  payload.sku = payload.sku?.trim().toUpperCase();
  payload.name = payload.name.trim().toUpperCase();

  if (!payload.sku) {
    payload.sku = await generateProductSku(payload.model);
  }

  const product = await Product.create(payload);
  return res.status(201).json(product);
}

export async function listProducts(req: Request, res: Response) {
  const {
    q,
    page = "1",
    limit = "20",
  } = req.query;

  const filter: Record<string, unknown> = {
    is_active: { $ne: false },
  };

  if (typeof q === "string" && q) {
    filter.name = { $regex: q, $options: "i" };
  }

  const pageNum = Math.max(parseInt(String(page), 10) || 1, 1);
  const limitNum = Math.min(
    Math.max(parseInt(String(limit), 10) || 20, 1),
    100,
  );

  const [items, total] = await Promise.all([
    Product.find(filter)
      .sort({ name: 1, model: 1 })
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

export async function updateProduct(req: Request, res: Response) {
  const { id } = req.params;
  assertValidObjectId(id);

  const allowedFields = ["name", "model", "price"];
  const payload = Object.fromEntries(
    Object.entries(req.body).filter(([key]) => allowedFields.includes(key)),
  );

  if (typeof payload.name === "string") {
    payload.name = payload.name.trim().toUpperCase();
  }

  const product = await Product.findByIdAndUpdate(id, payload, {
    new: true,
    runValidators: true,
  });

  if (!product) {
    throw new AppError(404, "NOT_FOUND", "Product not found");
  }

  return res.json(product);
}

export async function deleteProduct(req: Request, res: Response) {
  const { id } = req.params;
  assertValidObjectId(id);

  const product = await Product.findByIdAndDelete(id);

  if (!product) {
    throw new AppError(404, "NOT_FOUND", "Product not found");
  }

  return res.json({ message: "Product deleted successfully" });
}

import type { Request, Response } from "express";
import mongoose from "mongoose";
import ProductModel from "../models/ProductModel.js";
import { AppError } from "../utils/AppError.js";

function assertValidObjectId(id: string): void {
  if (!mongoose.isValidObjectId(id)) {
    throw new AppError(400, "BAD_REQUEST", "Invalid product model id");
  }
}

export async function listProductModels(req: Request, res: Response) {
  const models = await ProductModel.find().sort({ label: 1 });
  return res.json({ items: models });
}

function deriveSkuPrefix(label: string): string {
  const initials = label
    .trim()
    .split(/\s+/)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("")
    .slice(0, 3);
  return initials || "PR";
}

export async function createProductModel(req: Request, res: Response) {
  const { label } = req.body as { label: string };
  const sku_prefix = deriveSkuPrefix(label);
  const model = await ProductModel.create({ label, sku_prefix });
  return res.status(201).json(model);
}

export async function updateProductModel(req: Request, res: Response) {
  const { id } = req.params;
  assertValidObjectId(id);

  const { label } = req.body as { label: string };
  const sku_prefix = deriveSkuPrefix(label);

  const model = await ProductModel.findByIdAndUpdate(
    id,
    { label, sku_prefix },
    { new: true, runValidators: true },
  );

  if (!model) throw new AppError(404, "NOT_FOUND", "Product model not found");

  return res.json(model);
}

export async function deleteProductModel(req: Request, res: Response) {
  const { id } = req.params;
  assertValidObjectId(id);

  const model = await ProductModel.findByIdAndDelete(id);

  if (!model) throw new AppError(404, "NOT_FOUND", "Product model not found");

  return res.json({ message: "Product model deleted successfully" });
}

import mongoose from "mongoose";
import { PRODUCT_MODELS } from "../constants/productCategories.js";

const productSchema = new mongoose.Schema(
  {
    sku: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      uppercase: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    model: {
      type: String,
      enum: PRODUCT_MODELS,
      required: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
      validate: {
        validator: Number.isInteger,
        message: "price must be a whole integer",
      },
    },
  },
  {
    timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
  },
);

productSchema.index({ name: 1, model: 1 }, { unique: true });

const Product = mongoose.model("Product", productSchema);

export default Product;

import mongoose from "mongoose";

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
    type: {
      type: String,
      enum: ["direct", "model"],
      required: true,
      default: "model",
    },
    model: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ProductModel",
      required: false,
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

import mongoose from "mongoose";

const productModelSchema = new mongoose.Schema(
  {
    label: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    sku_prefix: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
      maxlength: 3,
    },
  },
  { timestamps: { createdAt: "created_at", updatedAt: "updated_at" } },
);

const ProductModel = mongoose.model("ProductModel", productModelSchema);
export default ProductModel;

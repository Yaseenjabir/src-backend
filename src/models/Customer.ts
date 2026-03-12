import mongoose from "mongoose";

const customerSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    shop_name: { type: String, trim: true },
    address: { type: String, trim: true },
    phone: { type: String, trim: true },
    notes: { type: String, trim: true },
    is_active: { type: Boolean, default: true },
    opening_balance: { type: Number, default: 0, min: 0 },
    opening_balance_set: { type: Boolean, default: false },
  },
  {
    timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
  },
);

customerSchema.index({ phone: 1 });

const Customer = mongoose.model("Customer", customerSchema);

export default Customer;

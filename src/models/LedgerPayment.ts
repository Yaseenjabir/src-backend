import mongoose from "mongoose";

const ledgerPaymentSchema = new mongoose.Schema(
  {
    customer_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer",
      required: true,
    },
    payment_date: { type: Date, required: true },
    amount: { type: Number, required: true, min: 1 },
    method: {
      type: String,
      enum: ["CASH", "BANK", "OTHER"],
      required: true,
    },
    notes: { type: String, trim: true },
  },
  {
    timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
  },
);

ledgerPaymentSchema.index({ customer_id: 1, payment_date: -1 });

const LedgerPayment = mongoose.model("LedgerPayment", ledgerPaymentSchema);

export default LedgerPayment;

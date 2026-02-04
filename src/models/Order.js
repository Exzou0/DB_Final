import mongoose from "mongoose";

const orderItemSchema = new mongoose.Schema(
  {
    product_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product"
    },
    name: String,
    price: Number,
    quantity: Number
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    products: [orderItemSchema],
    total_price: Number,
    status: {
      type: String,
      enum: ["Pending", "Completed", "Cancelled"],
      default: "Pending"
    }
  },
  { timestamps: true }
);

export default mongoose.model("Order", orderSchema);

orderSchema.index({ user_id: 1, createdAt: -1 });

orderSchema.index({ user_id: 1 });
orderSchema.index({ status: 1 });
orderSchema.index({ order_date: -1 });

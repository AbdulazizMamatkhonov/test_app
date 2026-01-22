const mongoose = require("mongoose");

const purchaseOrderItemSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
    },
    unitCost: {
      type: Number,
      required: true,
      min: 0,
    },
    lineTotal: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  { _id: false }
);

const receiptItemSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
    },
    unitCost: {
      type: Number,
      required: true,
      min: 0,
    },
    lineTotal: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  { _id: false }
);

const receiptSchema = new mongoose.Schema(
  {
    receivedAt: {
      type: Date,
      required: true,
    },
    items: {
      type: [receiptItemSchema],
      default: [],
      validate: {
        validator: (value) => Array.isArray(value) && value.length > 0,
        message: "Receipt must include at least one item",
      },
    },
    note: {
      type: String,
      trim: true,
      default: "",
    },
  },
  { _id: false }
);

const purchaseOrderSchema = new mongoose.Schema(
  {
    tenant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Tenant",
      required: true,
    },
    supplier: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Supplier",
      required: true,
    },
    items: {
      type: [purchaseOrderItemSchema],
      default: [],
      validate: {
        validator: (value) => Array.isArray(value) && value.length > 0,
        message: "Purchase order must include at least one item",
      },
    },
    status: {
      type: String,
      enum: ["draft", "ordered", "received", "partial"],
      default: "draft",
    },
    subtotal: {
      type: Number,
      required: true,
      min: 0,
    },
    expectedAt: {
      type: Date,
    },
    receivedAt: {
      type: Date,
    },
    receipts: {
      type: [receiptSchema],
      default: [],
    },
    note: {
      type: String,
      trim: true,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("PurchaseOrder", purchaseOrderSchema);

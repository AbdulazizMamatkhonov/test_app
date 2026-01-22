const express = require("express");
const mongoose = require("mongoose");

const PurchaseOrder = require("../models/purchase-order");
const Supplier = require("../models/supplier");
const Product = require("../models/product");

const router = express.Router();

const ensureSupplierExists = async (supplierId) => {
  if (!mongoose.Types.ObjectId.isValid(supplierId)) {
    return false;
  }

  const supplier = await Supplier.findById(supplierId);
  return Boolean(supplier);
};

const ensureProductIdsExist = async (items) => {
  const productIds = items.map((item) => item.productId);
  const existingProducts = await Product.find({ _id: { $in: productIds } });

  return existingProducts.length === productIds.length;
};

const buildItems = (items) =>
  items.map((item) => ({
    product: item.productId,
    quantity: item.quantity,
    unitCost: item.unitCost,
    lineTotal: item.quantity * item.unitCost,
  }));

const calculateSubtotal = (items) =>
  items.reduce((sum, item) => sum + item.quantity * item.unitCost, 0);

router.get("/", async (req, res, next) => {
  try {
    const orders = await PurchaseOrder.find()
      .populate("supplier", "name")
      .populate("items.product", "name sku")
      .sort({ createdAt: -1 });

    res.json({ data: orders });
  } catch (error) {
    next(error);
  }
});

router.post("/", async (req, res, next) => {
  try {
    const { supplierId, items, status, expectedAt, note } = req.body;

    if (!supplierId || !(await ensureSupplierExists(supplierId))) {
      res.status(400).json({ error: "Valid supplierId is required" });
      return;
    }

    if (!Array.isArray(items) || items.length === 0) {
      res.status(400).json({ error: "Purchase order must include items" });
      return;
    }

    if (!(await ensureProductIdsExist(items))) {
      res.status(400).json({ error: "Invalid product in items" });
      return;
    }

    const orderItems = buildItems(items);
    const subtotal = calculateSubtotal(items);

    const order = await PurchaseOrder.create({
      supplier: supplierId,
      items: orderItems,
      status: status || "draft",
      subtotal,
      expectedAt: expectedAt ? new Date(expectedAt) : undefined,
      note,
    });

    res.status(201).json({ data: order });
  } catch (error) {
    next(error);
  }
});

router.get("/:id", async (req, res, next) => {
  try {
    const order = await PurchaseOrder.findById(req.params.id)
      .populate("supplier", "name")
      .populate("items.product", "name sku");

    if (!order) {
      res.status(404).json({ error: "Purchase order not found" });
      return;
    }

    res.json({ data: order });
  } catch (error) {
    next(error);
  }
});

module.exports = router;

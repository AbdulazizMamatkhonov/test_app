const express = require("express");
const mongoose = require("mongoose");

const PurchaseOrder = require("../models/purchase-order");
const Supplier = require("../models/supplier");
const Product = require("../models/product");
const StockEntry = require("../models/stock-entry");

const router = express.Router();

const ensureSupplierExists = async (supplierId, tenantId) => {
  if (!mongoose.Types.ObjectId.isValid(supplierId)) {
    return false;
  }

  const supplier = await Supplier.findOne({ _id: supplierId, tenant: tenantId });
  return Boolean(supplier);
};

const ensureProductIdsExist = async (items, tenantId) => {
  const productIds = items.map((item) => item.productId);
  const existingProducts = await Product.find({
    _id: { $in: productIds },
    tenant: tenantId,
  });

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

const getReceivedTotals = (order) => {
  const totals = new Map();

  order.receipts.forEach((receipt) => {
    receipt.items.forEach((item) => {
      const key = item.product.toString();
      totals.set(key, (totals.get(key) || 0) + item.quantity);
    });
  });

  return totals;
};

const buildReceiptItems = (order, requestedItems) => {
  const receivedTotals = getReceivedTotals(order);
  const orderItemsByProduct = new Map(
    order.items.map((item) => [item.product.toString(), item])
  );

  const itemsToReceive =
    Array.isArray(requestedItems) && requestedItems.length > 0
      ? requestedItems
      : order.items.map((item) => ({
          productId: item.product.toString(),
          quantity:
            item.quantity - (receivedTotals.get(item.product.toString()) || 0),
        }));

  const receiptItems = [];

  for (const requestedItem of itemsToReceive) {
    if (!mongoose.Types.ObjectId.isValid(requestedItem.productId)) {
      throw new Error("Invalid product in receipt items");
    }

    const orderItem = orderItemsByProduct.get(requestedItem.productId);

    if (!orderItem) {
      throw new Error("Receipt item not found in purchase order");
    }

    const alreadyReceived = receivedTotals.get(requestedItem.productId) || 0;
    const remainingQuantity = orderItem.quantity - alreadyReceived;
    const quantity = requestedItem.quantity;

    if (!Number.isFinite(quantity) || quantity <= 0) {
      throw new Error("Receipt quantity must be greater than zero");
    }

    if (quantity > remainingQuantity) {
      throw new Error("Receipt quantity exceeds remaining quantity");
    }

    receiptItems.push({
      product: orderItem.product,
      quantity,
      unitCost: orderItem.unitCost,
      lineTotal: quantity * orderItem.unitCost,
    });
  }

  return receiptItems.filter((item) => item.quantity > 0);
};

router.get("/", async (req, res, next) => {
  try {
    const orders = await PurchaseOrder.find({ tenant: req.tenant._id })
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

    if (!supplierId || !(await ensureSupplierExists(supplierId, req.tenant._id))) {
      res.status(400).json({ error: "Valid supplierId is required" });
      return;
    }

    if (!Array.isArray(items) || items.length === 0) {
      res.status(400).json({ error: "Purchase order must include items" });
      return;
    }

    if (!(await ensureProductIdsExist(items, req.tenant._id))) {
      res.status(400).json({ error: "Invalid product in items" });
      return;
    }

    const orderItems = buildItems(items);
    const subtotal = calculateSubtotal(items);

    const order = await PurchaseOrder.create({
      tenant: req.tenant._id,
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
    const order = await PurchaseOrder.findOne({
      _id: req.params.id,
      tenant: req.tenant._id,
    })
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

router.post("/:id/receive", async (req, res, next) => {
  const session = await mongoose.startSession();

  try {
    await session.withTransaction(async () => {
      const order = await PurchaseOrder.findOne({
        _id: req.params.id,
        tenant: req.tenant._id,
      }).session(session);

      if (!order) {
        res.status(404).json({ error: "Purchase order not found" });
        return;
      }

      if (order.status === "received") {
        res.status(400).json({ error: "Purchase order already received" });
        return;
      }

      let receiptItems;
      try {
        receiptItems = buildReceiptItems(order, req.body.items);
      } catch (error) {
        res.status(400).json({ error: error.message });
        return;
      }

      if (receiptItems.length === 0) {
        res.status(400).json({ error: "No remaining items to receive" });
        return;
      }

      const stockEntries = receiptItems.map((item) => ({
        tenant: req.tenant._id,
        product: item.product,
        type: "in",
        quantity: item.quantity,
        unitCost: item.unitCost,
        note: `PO ${order._id}`,
      }));

      if (stockEntries.length > 0) {
        await StockEntry.insertMany(stockEntries, { session });
      }

      const receivedAt = req.body.receivedAt ? new Date(req.body.receivedAt) : new Date();

      order.receipts.push({
        receivedAt,
        items: receiptItems,
        note: req.body.note,
      });

      const receivedTotals = getReceivedTotals(order);
      const isFullyReceived = order.items.every((item) => {
        const totalReceived = receivedTotals.get(item.product.toString()) || 0;
        return totalReceived >= item.quantity;
      });

      order.status = isFullyReceived ? "received" : "partial";
      order.receivedAt = isFullyReceived ? receivedAt : undefined;
      await order.save({ session });

      res.json({ data: order });
    });
  } catch (error) {
    next(error);
  } finally {
    session.endSession();
  }
});

module.exports = router;

const express = require("express");
const mongoose = require("mongoose");

const Sale = require("../models/sale");
const Product = require("../models/product");
const StockEntry = require("../models/stock-entry");
const Customer = require("../models/customer");
const Payment = require("../models/payment");

const router = express.Router();

const ensureCustomerExists = async (customerId, tenantId) => {
  if (!mongoose.Types.ObjectId.isValid(customerId)) {
    return false;
  }

  const customer = await Customer.findOne({ _id: customerId, tenant: tenantId });
  return Boolean(customer);
};

const ensureProductIdsExist = async (items, tenantId) => {
  const productIds = items.map((item) => item.productId);
  const existingProducts = await Product.find({
    _id: { $in: productIds },
    tenant: tenantId,
  });

  return existingProducts.length === productIds.length;
};

const calculateTotals = (items, discount) => {
  const subtotal = items.reduce(
    (sum, item) => sum + item.quantity * item.unitPrice,
    0
  );

  const total = Math.max(subtotal - (discount || 0), 0);

  return { subtotal, total };
};

const buildSaleItems = (items) =>
  items.map((item) => ({
    product: item.productId,
    quantity: item.quantity,
    unitPrice: item.unitPrice,
    lineTotal: item.quantity * item.unitPrice,
  }));

router.get("/", async (req, res, next) => {
  try {
    const sales = await Sale.find({ tenant: req.tenant._id })
      .populate("customer", "name")
      .populate("items.product", "name sku")
      .sort({ createdAt: -1 });

    res.json({ data: sales });
  } catch (error) {
    next(error);
  }
});

router.post("/", async (req, res, next) => {
  const session = await mongoose.startSession();

  try {
    const { customerId, items, discount, paidAmount, paymentMethod } = req.body;

    if (!Array.isArray(items) || items.length === 0) {
      res.status(400).json({ error: "Sale must include items" });
      return;
    }

    if (!(await ensureProductIdsExist(items, req.tenant._id))) {
      res.status(400).json({ error: "Invalid product in items" });
      return;
    }

    if (customerId && !(await ensureCustomerExists(customerId, req.tenant._id))) {
      res.status(400).json({ error: "Invalid customerId" });
      return;
    }

    const { subtotal, total } = calculateTotals(items, discount);
    const paid = Number(paidAmount || 0);
    let status = "unpaid";

    if (paid >= total) {
      status = "paid";
    } else if (paid > 0) {
      status = "partial";
    }

    const saleItems = buildSaleItems(items);

    await session.withTransaction(async () => {
      const [sale] = await Sale.create(
        [
          {
            tenant: req.tenant._id,
            customer: customerId,
            items: saleItems,
            subtotal,
            discount: discount || 0,
            total,
            status,
          },
        ],
        { session }
      );

      const stockEntries = saleItems.map((item) => ({
        tenant: req.tenant._id,
        product: item.product,
        type: "out",
        quantity: item.quantity,
        note: `Sale ${sale._id}`,
      }));

      if (stockEntries.length > 0) {
        await StockEntry.insertMany(stockEntries, { session });
      }

      if (paid > 0 && customerId) {
        await Payment.create(
          [
            {
              tenant: req.tenant._id,
              customer: customerId,
              sale: sale._id,
              amount: paid,
              method: paymentMethod || "cash",
              note: "Initial payment",
            },
          ],
          { session }
        );
      }

      res.status(201).json({ data: sale });
    });
  } catch (error) {
    next(error);
  } finally {
    session.endSession();
  }
});

router.get("/:id", async (req, res, next) => {
  try {
    const sale = await Sale.findOne({
      _id: req.params.id,
      tenant: req.tenant._id,
    })
      .populate("customer", "name")
      .populate("items.product", "name sku");

    if (!sale) {
      res.status(404).json({ error: "Sale not found" });
      return;
    }

    res.json({ data: sale });
  } catch (error) {
    next(error);
  }
});

module.exports = router;

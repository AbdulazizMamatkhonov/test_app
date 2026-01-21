const express = require("express");
const mongoose = require("mongoose");

const StockEntry = require("../models/stock-entry");
const Product = require("../models/product");

const router = express.Router();

const ensureProductExists = async (productId) => {
  if (!mongoose.Types.ObjectId.isValid(productId)) {
    return false;
  }

  const product = await Product.findById(productId);
  return Boolean(product);
};

router.get("/", async (req, res, next) => {
  try {
    const entries = await StockEntry.find()
      .populate("product", "name sku")
      .sort({ createdAt: -1 });

    res.json({ data: entries });
  } catch (error) {
    next(error);
  }
});

router.post("/entries", async (req, res, next) => {
  try {
    const { productId, type, quantity, unitCost, note } = req.body;

    if (!productId || !(await ensureProductExists(productId))) {
      res.status(400).json({ error: "Valid productId is required" });
      return;
    }

    const entry = await StockEntry.create({
      product: productId,
      type,
      quantity,
      unitCost,
      note,
    });

    res.status(201).json({ data: entry });
  } catch (error) {
    next(error);
  }
});

router.get("/:productId", async (req, res, next) => {
  try {
    const { productId } = req.params;

    if (!productId || !(await ensureProductExists(productId))) {
      res.status(404).json({ error: "Product not found" });
      return;
    }

    const results = await StockEntry.aggregate([
      { $match: { product: new mongoose.Types.ObjectId(productId) } },
      {
        $group: {
          _id: "$product",
          totalIn: {
            $sum: {
              $cond: [{ $eq: ["$type", "in"] }, "$quantity", 0],
            },
          },
          totalOut: {
            $sum: {
              $cond: [{ $eq: ["$type", "out"] }, "$quantity", 0],
            },
          },
          totalAdjustment: {
            $sum: {
              $cond: [{ $eq: ["$type", "adjustment"] }, "$quantity", 0],
            },
          },
        },
      },
      {
        $project: {
          totalIn: 1,
          totalOut: 1,
          totalAdjustment: 1,
          onHand: {
            $add: ["$totalIn", "$totalAdjustment", { $multiply: [-1, "$totalOut"] }],
          },
        },
      },
    ]);

    const summary =
      results[0] ||
      {
        totalIn: 0,
        totalOut: 0,
        totalAdjustment: 0,
        onHand: 0,
      };

    res.json({ data: summary });
  } catch (error) {
    next(error);
  }
});

module.exports = router;

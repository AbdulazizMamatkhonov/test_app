const express = require("express");
const mongoose = require("mongoose");

const Sale = require("../models/sale");
const Payment = require("../models/payment");

const router = express.Router();

router.get("/customers/:customerId", async (req, res, next) => {
  try {
    const { customerId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(customerId)) {
      res.status(400).json({ error: "Invalid customerId" });
      return;
    }

    const [salesTotal] = await Sale.aggregate([
      { $match: { customer: new mongoose.Types.ObjectId(customerId) } },
      { $group: { _id: "$customer", total: { $sum: "$total" } } },
    ]);

    const [paymentsTotal] = await Payment.aggregate([
      { $match: { customer: new mongoose.Types.ObjectId(customerId) } },
      { $group: { _id: "$customer", total: { $sum: "$amount" } } },
    ]);

    const totalSales = salesTotal?.total || 0;
    const totalPayments = paymentsTotal?.total || 0;

    res.json({
      data: {
        customerId,
        totalSales,
        totalPayments,
        outstanding: Math.max(totalSales - totalPayments, 0),
      },
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;

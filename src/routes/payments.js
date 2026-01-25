const express = require("express");
const mongoose = require("mongoose");

const Payment = require("../models/payment");
const Customer = require("../models/customer");
const Sale = require("../models/sale");

const router = express.Router();

const ensureCustomerExists = async (customerId) => {
  if (!mongoose.Types.ObjectId.isValid(customerId)) {
    return false;
  }

  const customer = await Customer.findById(customerId);
  return Boolean(customer);
};

router.get("/", async (req, res, next) => {
  try {
    const payments = await Payment.find()
      .populate("customer", "name")
      .populate("sale", "total status")
      .sort({ createdAt: -1 });

    res.json({ data: payments });
  } catch (error) {
    next(error);
  }
});

router.post("/", async (req, res, next) => {
  try {
    const { customerId, saleId, amount, method, note } = req.body;

    if (!customerId || !(await ensureCustomerExists(customerId))) {
      res.status(400).json({ error: "Valid customerId is required" });
      return;
    }

    let sale = null;
    if (saleId) {
      if (!mongoose.Types.ObjectId.isValid(saleId)) {
        res.status(400).json({ error: "Invalid saleId" });
        return;
      }
      sale = await Sale.findById(saleId);
      if (!sale) {
        res.status(404).json({ error: "Sale not found" });
        return;
      }
    }

    const payment = await Payment.create({
      customer: customerId,
      sale: saleId,
      amount,
      method,
      note,
    });

    if (sale) {
      const totalPaid = await Payment.aggregate([
        { $match: { sale: sale._id } },
        { $group: { _id: "$sale", amount: { $sum: "$amount" } } },
      ]);

      const paidAmount = totalPaid[0]?.amount || 0;
      let status = "unpaid";

      if (paidAmount >= sale.total) {
        status = "paid";
      } else if (paidAmount > 0) {
        status = "partial";
      }

      sale.status = status;
      await sale.save();
    }

    res.status(201).json({ data: payment });
  } catch (error) {
    next(error);
  }
});

module.exports = router;

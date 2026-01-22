const express = require("express");

const Customer = require("../models/customer");

const router = express.Router();

router.get("/", async (req, res, next) => {
  try {
    const customers = await Customer.find({ tenant: req.tenant._id }).sort({
      createdAt: -1,
    });
    res.json({ data: customers });
  } catch (error) {
    next(error);
  }
});

router.post("/", async (req, res, next) => {
  try {
    const customer = await Customer.create({
      tenant: req.tenant._id,
      name: req.body.name,
      phone: req.body.phone,
      email: req.body.email,
      address: req.body.address,
      isActive: req.body.isActive,
    });

    res.status(201).json({ data: customer });
  } catch (error) {
    next(error);
  }
});

router.get("/:id", async (req, res, next) => {
  try {
    const customer = await Customer.findOne({
      _id: req.params.id,
      tenant: req.tenant._id,
    });

    if (!customer) {
      res.status(404).json({ error: "Customer not found" });
      return;
    }

    res.json({ data: customer });
  } catch (error) {
    next(error);
  }
});

router.put("/:id", async (req, res, next) => {
  try {
    const customer = await Customer.findOneAndUpdate(
      { _id: req.params.id, tenant: req.tenant._id },
      {
        name: req.body.name,
        phone: req.body.phone,
        email: req.body.email,
        address: req.body.address,
        isActive: req.body.isActive,
      },
      { new: true, runValidators: true }
    );

    if (!customer) {
      res.status(404).json({ error: "Customer not found" });
      return;
    }

    res.json({ data: customer });
  } catch (error) {
    next(error);
  }
});

router.delete("/:id", async (req, res, next) => {
  try {
    const customer = await Customer.findOneAndDelete({
      _id: req.params.id,
      tenant: req.tenant._id,
    });

    if (!customer) {
      res.status(404).json({ error: "Customer not found" });
      return;
    }

    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

module.exports = router;

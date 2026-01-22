const express = require("express");

const Supplier = require("../models/supplier");

const router = express.Router();

router.get("/", async (req, res, next) => {
  try {
    const suppliers = await Supplier.find({ tenant: req.tenant._id }).sort({
      createdAt: -1,
    });
    res.json({ data: suppliers });
  } catch (error) {
    next(error);
  }
});

router.post("/", async (req, res, next) => {
  try {
    const supplier = await Supplier.create({
      tenant: req.tenant._id,
      name: req.body.name,
      contactName: req.body.contactName,
      phone: req.body.phone,
      email: req.body.email,
      address: req.body.address,
      isActive: req.body.isActive,
    });

    res.status(201).json({ data: supplier });
  } catch (error) {
    next(error);
  }
});

router.get("/:id", async (req, res, next) => {
  try {
    const supplier = await Supplier.findOne({
      _id: req.params.id,
      tenant: req.tenant._id,
    });

    if (!supplier) {
      res.status(404).json({ error: "Supplier not found" });
      return;
    }

    res.json({ data: supplier });
  } catch (error) {
    next(error);
  }
});

router.put("/:id", async (req, res, next) => {
  try {
    const supplier = await Supplier.findOneAndUpdate(
      { _id: req.params.id, tenant: req.tenant._id },
      {
        name: req.body.name,
        contactName: req.body.contactName,
        phone: req.body.phone,
        email: req.body.email,
        address: req.body.address,
        isActive: req.body.isActive,
      },
      { new: true, runValidators: true }
    );

    if (!supplier) {
      res.status(404).json({ error: "Supplier not found" });
      return;
    }

    res.json({ data: supplier });
  } catch (error) {
    next(error);
  }
});

router.delete("/:id", async (req, res, next) => {
  try {
    const supplier = await Supplier.findOneAndDelete({
      _id: req.params.id,
      tenant: req.tenant._id,
    });

    if (!supplier) {
      res.status(404).json({ error: "Supplier not found" });
      return;
    }

    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

module.exports = router;

const express = require("express");

const Product = require("../models/product");

const router = express.Router();

router.get("/", async (req, res, next) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });
    res.json({ data: products });
  } catch (error) {
    next(error);
  }
});

router.post("/", async (req, res, next) => {
  try {
    const product = await Product.create({
      name: req.body.name,
      sku: req.body.sku,
      description: req.body.description,
      unitPrice: req.body.unitPrice,
      currency: req.body.currency,
      isActive: req.body.isActive,
    });

    res.status(201).json({ data: product });
  } catch (error) {
    next(error);
  }
});

router.get("/:id", async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      res.status(404).json({ error: "Product not found" });
      return;
    }

    res.json({ data: product });
  } catch (error) {
    next(error);
  }
});

router.put("/:id", async (req, res, next) => {
  try {
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      {
        name: req.body.name,
        sku: req.body.sku,
        description: req.body.description,
        unitPrice: req.body.unitPrice,
        currency: req.body.currency,
        isActive: req.body.isActive,
      },
      { new: true, runValidators: true }
    );

    if (!product) {
      res.status(404).json({ error: "Product not found" });
      return;
    }

    res.json({ data: product });
  } catch (error) {
    next(error);
  }
});

router.delete("/:id", async (req, res, next) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);

    if (!product) {
      res.status(404).json({ error: "Product not found" });
      return;
    }

    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

module.exports = router;

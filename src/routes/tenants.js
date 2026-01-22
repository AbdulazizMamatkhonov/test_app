const express = require("express");

const Tenant = require("../models/tenant");
const authGuard = require("../middleware/auth-guard");
const roleGuard = require("../middleware/role-guard");

const router = express.Router();

router.use(authGuard);
router.use(roleGuard(["admin"]));

router.get("/", async (req, res, next) => {
  try {
    const tenants = await Tenant.find().sort({ createdAt: -1 });
    res.json({ data: tenants });
  } catch (error) {
    next(error);
  }
});

router.post("/", async (req, res, next) => {
  try {
    const tenant = await Tenant.create({
      name: req.body.name,
      contactName: req.body.contactName,
      contactPhone: req.body.contactPhone,
      contactEmail: req.body.contactEmail,
      isActive: req.body.isActive,
    });

    res.status(201).json({ data: tenant });
  } catch (error) {
    next(error);
  }
});

router.get("/:id", async (req, res, next) => {
  try {
    const tenant = await Tenant.findById(req.params.id);

    if (!tenant) {
      res.status(404).json({ error: "Tenant not found" });
      return;
    }

    res.json({ data: tenant });
  } catch (error) {
    next(error);
  }
});

router.put("/:id", async (req, res, next) => {
  try {
    const tenant = await Tenant.findByIdAndUpdate(
      req.params.id,
      {
        name: req.body.name,
        contactName: req.body.contactName,
        contactPhone: req.body.contactPhone,
        contactEmail: req.body.contactEmail,
        isActive: req.body.isActive,
      },
      { new: true, runValidators: true }
    );

    if (!tenant) {
      res.status(404).json({ error: "Tenant not found" });
      return;
    }

    res.json({ data: tenant });
  } catch (error) {
    next(error);
  }
});

router.delete("/:id", async (req, res, next) => {
  try {
    const tenant = await Tenant.findByIdAndDelete(req.params.id);

    if (!tenant) {
      res.status(404).json({ error: "Tenant not found" });
      return;
    }

    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

module.exports = router;

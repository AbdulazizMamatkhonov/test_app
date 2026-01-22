const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");

const Tenant = require("../models/tenant");
const User = require("../models/user");

const router = express.Router();

const buildToken = (user) => {
  const secret = process.env.JWT_SECRET || "development-secret";
  return jwt.sign(
    {
      sub: user._id.toString(),
      tenantId: user.tenant.toString(),
      role: user.role,
      email: user.email,
    },
    secret,
    { expiresIn: "12h" }
  );
};

router.post("/register", async (req, res, next) => {
  try {
    const { tenantId, name, email, password, role } = req.body;

    if (!tenantId || !mongoose.Types.ObjectId.isValid(tenantId)) {
      res.status(400).json({ error: "Valid tenantId is required" });
      return;
    }

    if (!name || !email || !password) {
      res.status(400).json({ error: "Name, email, and password are required" });
      return;
    }

    const tenant = await Tenant.findById(tenantId);
    if (!tenant || !tenant.isActive) {
      res.status(404).json({ error: "Tenant not found" });
      return;
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({
      tenant: tenantId,
      name,
      email,
      role,
      passwordHash,
    });

    res.status(201).json({
      data: {
        id: user._id,
        tenantId: user.tenant,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    if (error.code === 11000) {
      res.status(409).json({ error: "User already exists" });
      return;
    }
    next(error);
  }
});

router.post("/login", async (req, res, next) => {
  try {
    const { tenantId, email, password } = req.body;

    if (!tenantId || !mongoose.Types.ObjectId.isValid(tenantId)) {
      res.status(400).json({ error: "Valid tenantId is required" });
      return;
    }

    if (!email || !password) {
      res.status(400).json({ error: "Email and password are required" });
      return;
    }

    const user = await User.findOne({ tenant: tenantId, email: email.toLowerCase() });
    if (!user || !user.isActive) {
      res.status(401).json({ error: "Invalid credentials" });
      return;
    }

    const matches = await bcrypt.compare(password, user.passwordHash);
    if (!matches) {
      res.status(401).json({ error: "Invalid credentials" });
      return;
    }

    res.json({
      data: {
        token: buildToken(user),
        user: {
          id: user._id,
          tenantId: user.tenant,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      },
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;

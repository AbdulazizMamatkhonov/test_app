const express = require("express");

const Subscription = require("../models/subscription");

const router = express.Router();

router.post("/activate", async (req, res, next) => {
  try {
    const { key, plan, expiresAt } = req.body;

    if (!key) {
      res.status(400).json({ error: "Subscription key is required" });
      return;
    }

    const subscription = await Subscription.findOneAndUpdate(
      { key },
      {
        plan: plan || "starter",
        status: "active",
        startsAt: new Date(),
        expiresAt: expiresAt ? new Date(expiresAt) : null,
      },
      { new: true, upsert: true }
    );

    res.json({ data: subscription });
  } catch (error) {
    next(error);
  }
});

router.get("/status", async (req, res, next) => {
  try {
    const subscriptionKey = req.header("x-subscription-key");

    if (!subscriptionKey) {
      res.status(400).json({ error: "Missing subscription key" });
      return;
    }

    const subscription = await Subscription.findOne({ key: subscriptionKey });

    if (!subscription) {
      res.status(404).json({ error: "Subscription not found" });
      return;
    }

    const expired = subscription.expiresAt && subscription.expiresAt <= new Date();

    res.json({
      data: {
        key: subscription.key,
        plan: subscription.plan,
        status: expired ? "expired" : subscription.status,
        startsAt: subscription.startsAt,
        expiresAt: subscription.expiresAt,
      },
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;

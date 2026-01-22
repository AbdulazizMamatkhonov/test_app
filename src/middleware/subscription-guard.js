const Subscription = require("../models/subscription");

const subscriptionGuard = async (req, res, next) => {
  if (req.method === "OPTIONS") {
    next();
    return;
  }

  const subscriptionKey = req.header("x-subscription-key");

  if (!subscriptionKey) {
    res.status(402).json({
      error: "Subscription required",
      message: "Missing subscription key",
    });
    return;
  }

  try {
    const subscription = await Subscription.findOne({ key: subscriptionKey });
    const now = new Date();

    if (!subscription) {
      res.status(402).json({
        error: "Subscription required",
        message: "Subscription key not found",
      });
      return;
    }

    if (subscription.status !== "active") {
      res.status(402).json({
        error: "Subscription inactive",
        message: "Subscription is not active",
      });
      return;
    }

    if (subscription.expiresAt && subscription.expiresAt <= now) {
      subscription.status = "expired";
      await subscription.save();
      res.status(402).json({
        error: "Subscription expired",
        message: "Subscription has expired",
      });
      return;
    }

    req.subscription = subscription;
    next();
  } catch (error) {
    next(error);
  }
};

module.exports = subscriptionGuard;

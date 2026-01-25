const mongoose = require("mongoose");

const subscriptionSchema = new mongoose.Schema(
  {
    key: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    plan: {
      type: String,
      trim: true,
      default: "starter",
    },
    status: {
      type: String,
      enum: ["active", "inactive", "expired"],
      default: "inactive",
    },
    startsAt: {
      type: Date,
      default: Date.now,
    },
    expiresAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Subscription", subscriptionSchema);

const mongoose = require("mongoose");

const Tenant = require("../models/tenant");

const tenantGuard = async (req, res, next) => {
  if (process.env.TENANT_REQUIRED === "false") {
    next();
    return;
  }

  if (req.method === "OPTIONS") {
    next();
    return;
  }

  const tenantId = req.header("x-tenant-id") || req.user?.tenantId;

  if (!tenantId || !mongoose.Types.ObjectId.isValid(tenantId)) {
    res.status(400).json({ error: "Valid x-tenant-id header is required" });
    return;
  }

  try {
    const tenant = await Tenant.findById(tenantId);

    if (!tenant || !tenant.isActive) {
      res.status(404).json({ error: "Tenant not found or inactive" });
      return;
    }

    req.tenant = tenant;
    next();
  } catch (error) {
    next(error);
  }
};

module.exports = tenantGuard;

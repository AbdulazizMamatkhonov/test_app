const roleGuard = (allowedRoles = []) => (req, res, next) => {
  if (process.env.AUTH_REQUIRED === "false") {
    next();
    return;
  }

  const userRole = req.user?.role;
  if (!userRole || !allowedRoles.includes(userRole)) {
    res.status(403).json({ error: "Insufficient permissions" });
    return;
  }

  next();
};

module.exports = roleGuard;

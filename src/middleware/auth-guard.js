const jwt = require("jsonwebtoken");

const authGuard = (req, res, next) => {
  if (process.env.AUTH_REQUIRED === "false") {
    next();
    return;
  }

  if (req.method === "OPTIONS") {
    next();
    return;
  }

  const header = req.header("authorization");
  if (!header || !header.startsWith("Bearer ")) {
    res.status(401).json({ error: "Authorization token required" });
    return;
  }

  const token = header.replace("Bearer ", "").trim();
  const secret = process.env.JWT_SECRET || "development-secret";

  try {
    const payload = jwt.verify(token, secret);
    req.user = payload;
    next();
  } catch (error) {
    res.status(401).json({ error: "Invalid or expired token" });
  }
};

module.exports = authGuard;

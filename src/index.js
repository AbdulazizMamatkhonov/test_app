const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const dotenv = require("dotenv");

const { connectDatabase } = require("./config/db");
const healthRouter = require("./routes/health");
const subscriptionsRouter = require("./routes/subscriptions");
const productsRouter = require("./routes/products");
const stockRouter = require("./routes/stock");
const customersRouter = require("./routes/customers");
const salesRouter = require("./routes/sales");
const paymentsRouter = require("./routes/payments");
const debtsRouter = require("./routes/debts");
const suppliersRouter = require("./routes/suppliers");
const purchaseOrdersRouter = require("./routes/purchase-orders");
const errorHandler = require("./middleware/error-handler");
const subscriptionGuard = require("./middleware/subscription-guard");

dotenv.config();

const app = express();
const port = Number.parseInt(process.env.PORT, 10) || 3000;
const corsOrigins = (process.env.CORS_ORIGIN || "http://localhost:5173")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

const corsConfig = {
  origin: (origin, callback) => {
    if (!origin || corsOrigins.includes("*") || corsOrigins.includes(origin)) {
      callback(null, true);
      return;
    }
    callback(new Error("Not allowed by CORS"));
  },
  credentials: true,
};

app.use(express.json());
app.use(morgan("dev"));
app.use(cors(corsConfig));

app.use("/health", healthRouter);
app.use("/subscriptions", subscriptionsRouter);

app.use(subscriptionGuard);

app.use("/products", productsRouter);
app.use("/stock", stockRouter);
app.use("/customers", customersRouter);
app.use("/sales", salesRouter);
app.use("/payments", paymentsRouter);
app.use("/debts", debtsRouter);
app.use("/suppliers", suppliersRouter);
app.use("/purchase-orders", purchaseOrdersRouter);

app.get("/", (req, res) => {
  res.json({
    name: "Stock Management System API",
    status: "running",
  });
});

app.use((req, res) => {
  res.status(404).json({ error: "Not Found" });
});

app.use(errorHandler);

const startServer = async () => {
  try {
    await connectDatabase();
    app.listen(port, () => {
      // eslint-disable-next-line no-console
      console.log(`API listening on port ${port}`);
    });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("Failed to start API", error);
    process.exit(1);
  }
};

startServer();

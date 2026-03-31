require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");

const invoicesRouter = require("./routes/invoices");
const customersRouter = require("./routes/customers");
const productsRouter = require("./routes/products");
const servicesRouter = require("./routes/services");
const vendorsRouter = require("./routes/vendors");
const stockInRouter = require("./routes/stockIn");
const vendorPaymentsRouter = require("./routes/vendorPayments");
const authRouter = require("./routes/auth");
const dashboardRouter = require("./routes/dashboard");
const expensesRouter = require("./routes/expenses");
const utilitiesRouter = require("./routes/utilities");
const employeesRouter = require("./routes/employees");
const salariesRouter = require("./routes/salaries");
const dailyCloseRouter = require("./routes/dailyClose");
const settingsRouter = require("./routes/settings");
const vehiclesRouter = require("./routes/vehicles");
const app = express();
const PORT = process.env.PORT || 5000;

const allowedOrigins = [
  "http://localhost:3000",
  "http://127.0.0.1:3000",
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  "https://motorworks.pk",
  "https://www.motorworks.pk",
  "https://maws.pk", 
  "https://www.maws.pk",
  "https://portal.maws.pk"
];
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps or curl) or allowed list
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);
app.use(express.json({ limit: "5mb" }));

app.use("/api/invoices", invoicesRouter);
app.use("/api/customers", customersRouter);
app.use("/api/products", productsRouter);
app.use("/api/services", servicesRouter);
app.use("/api/vendors", vendorsRouter);
app.use("/api/stock-in", stockInRouter);
app.use("/api/vendor-payments", vendorPaymentsRouter);
app.use("/api/auth", authRouter);
app.use("/api/dashboard", dashboardRouter);
app.use("/api/expenses", expensesRouter);
app.use("/api/utilities", utilitiesRouter);
app.use("/api/employees", employeesRouter);
app.use("/api/salaries", salariesRouter);
app.use("/api/daily-close", dailyCloseRouter);
app.use("/api/settings", settingsRouter);
app.use("/api/vehicles", vehiclesRouter);

// MongoDB Connection and persistence — server starts only after DB is ready
const db = require("./data/db");

app.get("/api/health", (req, res) => {
  res.json({
    ok: true,
    message: "Momentum Autoworks API",
    database: mongoose.connection.readyState === 1 ? "connected" : "disconnected",
  });
});

mongoose
  .connect(process.env.MONGODB_URI)
  .then(async () => {
    console.log("✅ MongoDB connected successfully");
    await db.initialize();
    app.listen(PORT, () => {
      console.log(`🚀 Backend running at http://localhost:${PORT}`);
      console.log(`📊 Environment: ${process.env.NODE_ENV || "development"}`);
    });
  })
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err.message);
    process.exit(1);
  });

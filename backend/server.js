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



const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({ origin: ["http://localhost:3000", "http://127.0.0.1:3000"] }));
app.use(express.json());

app.use("/api/invoices", invoicesRouter);
app.use("/api/customers", customersRouter);
app.use("/api/products", productsRouter);
app.use("/api/services", servicesRouter);
app.use("/api/vendors", vendorsRouter);
app.use("/api/stock-in", stockInRouter);
app.use("/api/vendor-payments", vendorPaymentsRouter);
app.use("/api/auth", authRouter);


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

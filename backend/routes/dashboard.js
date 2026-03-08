const express = require("express");
const router = express.Router();
const { getDashboardStats, getInvoices } = require("../data/db");

router.get("/stats", async (req, res) => {
  try {
    const stats = await getDashboardStats();
    res.json(stats);
  } catch (err) {
    console.error("Dashboard stats error:", err);
    res.status(500).json({ message: "Failed to load dashboard stats." });
  }
});

/** Recent invoices for dashboard "Recent Jobs" (last 10) */
router.get("/recent-invoices", async (req, res) => {
  try {
    const list = await getInvoices();
    const recent = list.slice(0, 10);
    res.json(recent);
  } catch (err) {
    console.error("Recent invoices error:", err);
    res.status(500).json({ message: "Failed to load recent invoices." });
  }
});

module.exports = router;

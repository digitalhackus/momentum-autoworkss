const express = require("express");
const router = express.Router();
const {
  getUtilityTypes,
  addUtilityType,
  getUtilities,
  getUtilityById,
  addUtility,
  updateUtility,
  markUtilityPaid,
  getUtilitySummaryMonthly,
  getOutstandingUtilities,
} = require("../data/db");

router.get("/types", async (req, res) => {
  const list = await getUtilityTypes();
  res.json(list);
});

router.post("/types", express.json(), async (req, res) => {
  try {
    const { name } = req.body;
    if (!name || typeof name !== "string" || !name.trim()) {
      return res.status(400).json({ error: "name required" });
    }
    const created = await addUtilityType(name.trim());
    res.status(201).json(created);
  } catch (err) {
    res.status(400).json({ error: err.message || "Bad request" });
  }
});

router.get("/outstanding", async (req, res) => {
  const list = await getOutstandingUtilities();
  res.json(list);
});

router.get("/summary/monthly", async (req, res) => {
  const year = parseInt(req.query.year, 10);
  const month = parseInt(req.query.month, 10);
  if (isNaN(year) || isNaN(month) || month < 1 || month > 12) {
    return res.status(400).json({ error: "year and month query required (1-12)" });
  }
  const summary = await getUtilitySummaryMonthly(year, month);
  res.json(summary);
});

router.get("/", async (req, res) => {
  const { status, dueDateFrom, dueDateTo } = req.query;
  const filters = {};
  if (status) filters.status = status;
  if (dueDateFrom) filters.dueDateFrom = dueDateFrom;
  if (dueDateTo) filters.dueDateTo = dueDateTo;
  const list = await getUtilities(filters);
  res.json(list);
});

router.get("/:id", async (req, res) => {
  const doc = await getUtilityById(req.params.id);
  if (!doc) return res.status(404).json({ error: "Utility not found" });
  res.json(doc);
});

router.post("/", express.json(), async (req, res) => {
  try {
    const created = await addUtility(req.body);
    res.status(201).json(created);
  } catch (err) {
    res.status(400).json({ error: err.message || "Bad request" });
  }
});

router.patch("/:id", express.json(), async (req, res) => {
  const updated = await updateUtility(req.params.id, req.body);
  if (!updated) return res.status(404).json({ error: "Utility not found" });
  res.json(updated);
});

router.post("/:id/mark-paid", express.json(), async (req, res) => {
  const { payment_method: paymentMethod } = req.body || {};
  const updated = await markUtilityPaid(req.params.id, paymentMethod);
  if (!updated) return res.status(404).json({ error: "Utility not found" });
  res.json(updated);
});

module.exports = router;

const express = require("express");
const router = express.Router();
const {
  getExpenses,
  getExpenseById,
  addExpense,
  updateExpense,
  deleteExpense,
  getExpenseSummaryDaily,
  getExpenseSummaryMonthly,
} = require("../data/db");

router.get("/", async (req, res) => {
  const { dateFrom, dateTo, category } = req.query;
  const filters = {};
  if (dateFrom) filters.dateFrom = dateFrom;
  if (dateTo) filters.dateTo = dateTo;
  if (category) filters.category = category;
  const list = await getExpenses(filters);
  res.json(list);
});

router.get("/summary/daily", async (req, res) => {
  const { date } = req.query;
  if (!date) return res.status(400).json({ error: "date query required" });
  const summary = await getExpenseSummaryDaily(date);
  res.json(summary);
});

router.get("/summary/monthly", async (req, res) => {
  const year = parseInt(req.query.year, 10);
  const month = parseInt(req.query.month, 10);
  if (isNaN(year) || isNaN(month) || month < 1 || month > 12) {
    return res.status(400).json({ error: "year and month query required (1-12)" });
  }
  const summary = await getExpenseSummaryMonthly(year, month);
  res.json(summary);
});

router.get("/:id", async (req, res) => {
  const doc = await getExpenseById(req.params.id);
  if (!doc) return res.status(404).json({ error: "Expense not found" });
  res.json(doc);
});

router.post("/", express.json(), async (req, res) => {
  try {
    const created = await addExpense(req.body);
    res.status(201).json(created);
  } catch (err) {
    res.status(400).json({ error: err.message || "Bad request" });
  }
});

router.patch("/:id", express.json(), async (req, res) => {
  const updated = await updateExpense(req.params.id, req.body);
  if (!updated) return res.status(404).json({ error: "Expense not found" });
  res.json(updated);
});

router.delete("/:id", async (req, res) => {
  const ok = await deleteExpense(req.params.id);
  if (!ok) return res.status(404).json({ error: "Expense not found" });
  res.status(204).send();
});

module.exports = router;

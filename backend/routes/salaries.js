const express = require("express");
const router = express.Router();
const {
  getEmployees,
  getEmployeeById,
  getSalaryRecords,
  getSalaryRecordById,
  addSalaryRecord,
  markSalaryRecordPaid,
  getSalariesDashboardStats,
} = require("../data/db");

router.get("/dashboard", async (req, res) => {
  const stats = await getSalariesDashboardStats();
  res.json(stats);
});

router.get("/records", async (req, res) => {
  const { month, year, status, employee_id } = req.query;
  const filters = {};
  if (month !== undefined && month !== "") filters.month = parseInt(month, 10);
  if (year !== undefined && year !== "") filters.year = parseInt(year, 10);
  if (status) filters.status = status;
  if (employee_id) filters.employee_id = employee_id;
  const list = await getSalaryRecords(filters);
  res.json(list);
});

router.get("/records/:id", async (req, res) => {
  const doc = await getSalaryRecordById(req.params.id);
  if (!doc) return res.status(404).json({ error: "Salary record not found" });
  res.json(doc);
});

router.post("/records", express.json(), async (req, res) => {
  try {
    const { employee_id, month, year, bonus, deduction, notes } = req.body || {};
    if (!employee_id || !month || !year) {
      return res.status(400).json({ error: "employee_id, month and year are required" });
    }
    const emp = await getEmployeeById(employee_id);
    if (!emp) return res.status(400).json({ error: "Employee not found" });
    const salaryAmount = Number(emp.monthly_salary) || 0;
    const created = await addSalaryRecord({
      employee_id,
      month: Number(month),
      year: Number(year),
      salary_amount: salaryAmount,
      bonus: bonus != null ? parseFloat(bonus) : 0,
      deduction: deduction != null ? parseFloat(deduction) : 0,
      notes: notes != null ? String(notes).trim() : undefined,
    });
    res.status(201).json(created);
  } catch (err) {
    if (err.code === "DUPLICATE_SALARY") {
      return res.status(409).json({ error: err.message });
    }
    res.status(400).json({ error: err.message || "Bad request" });
  }
});

router.post("/records/:id/mark-paid", express.json(), async (req, res) => {
  try {
    const { payment_method: paymentMethod } = req.body || {};
    const updated = await markSalaryRecordPaid(req.params.id, paymentMethod);
    if (!updated) return res.status(404).json({ error: "Salary record not found" });
    res.json(updated);
  } catch (err) {
    if (err.code === "VALIDATION") {
      return res.status(400).json({ error: err.message });
    }
    res.status(400).json({ error: err.message || "Bad request" });
  }
});

module.exports = router;

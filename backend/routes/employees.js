const express = require("express");
const router = express.Router();
const {
  getEmployees,
  getEmployeeById,
  addEmployee,
  updateEmployee,
} = require("../data/db");

router.get("/", async (req, res) => {
  const list = await getEmployees();
  res.json(list);
});

router.get("/:id", async (req, res) => {
  const doc = await getEmployeeById(req.params.id);
  if (!doc) return res.status(404).json({ error: "Employee not found" });
  res.json(doc);
});

router.post("/", express.json(), async (req, res) => {
  try {
    const { name, phone, role, monthly_salary, joining_date, is_active } = req.body || {};
    if (!name || typeof name !== "string" || !name.trim()) {
      return res.status(400).json({ error: "name is required" });
    }
    const monthlySalary = parseFloat(monthly_salary);
    if (Number.isNaN(monthlySalary) || monthlySalary < 0) {
      return res.status(400).json({ error: "monthly_salary must be a non-negative number" });
    }
    const created = await addEmployee({
      name: name.trim(),
      phone: phone != null ? String(phone).trim() : undefined,
      role: role != null ? String(role).trim() : undefined,
      monthly_salary: monthlySalary,
      joining_date: joining_date && String(joining_date).trim() ? String(joining_date).trim() : undefined,
      is_active: is_active !== false,
    });
    res.status(201).json(created);
  } catch (err) {
    res.status(400).json({ error: err.message || "Bad request" });
  }
});

router.patch("/:id", express.json(), async (req, res) => {
  const updates = { ...req.body };
  delete updates.id;
  if (updates.monthly_salary != null) updates.monthly_salary = parseFloat(updates.monthly_salary);
  const updated = await updateEmployee(req.params.id, updates);
  if (!updated) return res.status(404).json({ error: "Employee not found" });
  res.json(updated);
});

module.exports = router;

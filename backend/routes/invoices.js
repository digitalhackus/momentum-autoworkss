const express = require("express");
const router = express.Router();
const {
  getInvoices,
  getInvoiceById,
  addInvoice,
  updateInvoice,
  deleteInvoice,
} = require("../data/db");

router.get("/", async (req, res) => {
  const list = await getInvoices();
  res.json(list);
});

router.get("/:id", async (req, res) => {
  const inv = await getInvoiceById(req.params.id);
  if (!inv) return res.status(404).json({ error: "Invoice not found" });
  res.json(inv);
});

router.post("/", express.json(), async (req, res) => {
  try {
    const created = await addInvoice(req.body);
    res.status(201).json(created);
  } catch (err) {
    res.status(400).json({ error: err.message || "Bad request" });
  }
});

router.patch("/:id", express.json(), async (req, res) => {
  const updated = await updateInvoice(req.params.id, req.body);
  if (!updated) return res.status(404).json({ error: "Invoice not found" });
  res.json(updated);
});

router.delete("/:id", async (req, res) => {
  const ok = await deleteInvoice(req.params.id);
  if (!ok) return res.status(404).json({ error: "Invoice not found" });
  res.status(204).send();
});

module.exports = router;

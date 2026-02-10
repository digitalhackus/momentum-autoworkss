const express = require("express");
const router = express.Router();
const {
  getVendors,
  getVendorById,
  getVendorStockIns,
  getVendorPayments,
  addVendor,
  updateVendor,
  deleteVendor,
} = require("../data/db");

router.get("/", async (req, res) => {
  const list = await getVendors();
  res.json(list);
});

router.get("/:id", async (req, res) => {
  const v = await getVendorById(req.params.id);
  if (!v) return res.status(404).json({ error: "Vendor not found" });
  res.json(v);
});

router.get("/:id/stock-ins", async (req, res) => {
  const list = await getVendorStockIns(req.params.id);
  res.json(list);
});

router.get("/:id/payments", async (req, res) => {
  const list = await getVendorPayments(req.params.id);
  res.json(list);
});

router.post("/", express.json(), async (req, res) => {
  try {
    const created = await addVendor(req.body);
    res.status(201).json(created);
  } catch (err) {
    res.status(400).json({ error: err.message || "Bad request" });
  }
});

router.patch("/:id", express.json(), async (req, res) => {
  const updated = await updateVendor(req.params.id, req.body);
  if (!updated) return res.status(404).json({ error: "Vendor not found" });
  res.json(updated);
});

router.delete("/:id", async (req, res) => {
  const ok = await deleteVendor(req.params.id);
  if (!ok) return res.status(404).json({ error: "Vendor not found" });
  res.status(204).send();
});

module.exports = router;

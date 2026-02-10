const express = require("express");
const router = express.Router();
const {
  getServices,
  addService,
  updateService,
  deleteService,
} = require("../data/db");

router.get("/", async (req, res) => {
  const list = await getServices();
  res.json(list);
});

router.post("/", express.json(), async (req, res) => {
  try {
    const created = await addService(req.body);
    res.status(201).json(created);
  } catch (err) {
    res.status(400).json({ error: err.message || "Bad request" });
  }
});

router.patch("/:id", express.json(), async (req, res) => {
  const updated = await updateService(req.params.id, req.body);
  if (!updated) return res.status(404).json({ error: "Service not found" });
  res.json(updated);
});

router.delete("/:id", async (req, res) => {
  const ok = await deleteService(req.params.id);
  if (!ok) return res.status(404).json({ error: "Service not found" });
  res.status(204).send();
});

module.exports = router;

const express = require("express");
const router = express.Router();
const {
  getCustomersList,
  getCustomerById,
  getVehiclesByCustomerId,
  addVehicle,
  updateVehicle,
  addCustomer,
  updateCustomer,
} = require("../data/db");

router.get("/", async (req, res) => {
  const list = await getCustomersList();
  res.json(list);
});

router.get("/:id/vehicles", async (req, res) => {
  const vehicles = await getVehiclesByCustomerId(req.params.id);
  res.json(vehicles);
});

router.post("/:id/vehicles", express.json(), async (req, res) => {
  const customerId = req.params.id;
  const c = await getCustomerById(customerId);
  if (!c) return res.status(404).json({ error: "Customer not found" });
  try {
    const created = await addVehicle(customerId, req.body);
    res.status(201).json(created);
  } catch (err) {
    res.status(400).json({ error: err.message || "Bad request" });
  }
});

router.patch("/:customerId/vehicles/:vehicleId", express.json(), async (req, res) => {
  const { customerId, vehicleId } = req.params;
  const c = await getCustomerById(customerId);
  if (!c) return res.status(404).json({ error: "Customer not found" });
  const updated = await updateVehicle(customerId, vehicleId, req.body);
  if (!updated) return res.status(404).json({ error: "Vehicle not found" });
  res.json(updated);
});

router.get("/:id", async (req, res) => {
  const c = await getCustomerById(req.params.id);
  if (!c) return res.status(404).json({ error: "Customer not found" });
  res.json(c);
});

router.post("/", express.json(), async (req, res) => {
  try {
    const created = await addCustomer(req.body);
    res.status(201).json(created);
  } catch (err) {
    res.status(400).json({ error: err.message || "Bad request" });
  }
});

router.patch("/:id", express.json(), async (req, res) => {
  const updated = await updateCustomer(req.params.id, req.body);
  if (!updated) return res.status(404).json({ error: "Customer not found" });
  res.json(updated);
});

module.exports = router;

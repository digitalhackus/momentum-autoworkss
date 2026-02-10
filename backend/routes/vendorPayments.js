const express = require("express");
const router = express.Router();
const { getVendorPaymentsList, addVendorPayment } = require("../data/db");

router.get("/", async (req, res) => {
  const list = await getVendorPaymentsList();
  res.json(list);
});

router.post("/", express.json(), async (req, res) => {
  try {
    const created = await addVendorPayment(req.body);
    res.status(201).json(created);
  } catch (err) {
    res.status(400).json({ error: err.message || "Bad request" });
  }
});

module.exports = router;

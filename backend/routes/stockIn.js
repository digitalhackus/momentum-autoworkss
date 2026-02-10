const express = require("express");
const router = express.Router();
const { getStockInRecords, addStockIn } = require("../data/db");

router.get("/", async (req, res) => {
  const list = await getStockInRecords();
  res.json(list);
});

router.post("/", express.json(), async (req, res) => {
  try {
    const created = await addStockIn(req.body);
    res.status(201).json(created);
  } catch (err) {
    res.status(400).json({ error: err.message || "Bad request" });
  }
});

module.exports = router;

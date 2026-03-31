const express = require("express");
const router = express.Router();
const { getVehicles } = require("../data/db");

router.get("/", async (req, res) => {
  try {
    const list = await getVehicles();
    res.json(list);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;

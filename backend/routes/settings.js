const express = require("express");
const router = express.Router();
const db = require("../data/db");

// Increase payload limit for logo base64 data
router.use(express.json({ limit: "5mb" }));

// GET /api/settings - Retrieve workshop settings
router.get("/", async (req, res) => {
  try {
    const settings = await db.getSettings();
    res.json(settings);
  } catch (err) {
    console.error("GET /settings error:", err);
    res.status(500).json({ error: "Failed to load settings" });
  }
});

// PATCH /api/settings - Update workshop settings
router.patch("/", async (req, res) => {
  try {
    const updated = await db.updateSettings(req.body);
    res.json(updated);
  } catch (err) {
    console.error("PATCH /settings error:", err);
    res.status(500).json({ error: "Failed to save settings" });
  }
});

module.exports = router;

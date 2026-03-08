const express = require("express");
const router = express.Router();
const {
  getDailyCloses,
  getDailyCloseByDate,
  getDailyClosePreview,
  closeDailyClose,
  reopenDailyClose,
} = require("../data/db");

router.get("/", async (req, res) => {
  const list = await getDailyCloses();
  res.json(list);
});

router.get("/preview/:date", async (req, res) => {
  try {
    const preview = await getDailyClosePreview(req.params.date);
    res.json(preview);
  } catch (err) {
    res.status(500).json({ error: err.message || "Failed to generate preview" });
  }
});

router.get("/:date", async (req, res) => {
  const record = await getDailyCloseByDate(req.params.date);
  if (!record) return res.status(404).json({ error: "No daily close found for this date" });
  res.json(record);
});

router.post("/", express.json(), async (req, res) => {
  try {
    const { date } = req.body;
    if (!date) return res.status(400).json({ error: "Date is required" });
    const result = await closeDailyClose(date);
    if (result.alreadyClosed) {
      return res.status(409).json({ error: "Day already closed", record: result.record });
    }
    res.status(201).json(result.record);
  } catch (err) {
    res.status(500).json({ error: err.message || "Failed to close day" });
  }
});

router.delete("/:date", async (req, res) => {
  const ok = await reopenDailyClose(req.params.date);
  if (!ok) return res.status(404).json({ error: "No daily close found for this date" });
  res.status(204).send();
});

module.exports = router;

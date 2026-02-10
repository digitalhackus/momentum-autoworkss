const express = require("express");
const router = express.Router();
const {
  getProducts,
  addProduct,
  updateProduct,
  deleteProduct,
  deductStock,
} = require("../data/db");

router.get("/", async (req, res) => {
  const list = await getProducts();
  res.json(list);
});

router.post("/", express.json(), async (req, res) => {
  try {
    const created = await addProduct(req.body);
    res.status(201).json(created);
  } catch (err) {
    res.status(400).json({ error: err.message || "Bad request" });
  }
});

router.patch("/:id", express.json(), async (req, res) => {
  const updated = await updateProduct(req.params.id, req.body);
  if (!updated) return res.status(404).json({ error: "Product not found" });
  res.json(updated);
});

router.delete("/:id", async (req, res) => {
  const ok = await deleteProduct(req.params.id);
  if (!ok) return res.status(404).json({ error: "Product not found" });
  res.status(204).send();
});

router.post("/:id/deduct-stock", express.json(), async (req, res) => {
  const { quantity } = req.body;
  if (typeof quantity !== "number" || quantity < 0) {
    return res.status(400).json({ error: "Invalid quantity" });
  }
  const updated = await deductStock(req.params.id, quantity);
  if (!updated) return res.status(404).json({ error: "Product not found" });
  res.json(updated);
});

module.exports = router;

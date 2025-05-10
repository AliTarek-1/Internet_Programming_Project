const express = require("express");
const router = express.Router();
const Inventory = require("../models/Inventory");
const { protect, admin } = require("../middleware/authMiddleware");

// Get all inventory items
router.get("/", protect, admin, async (req, res) => {
  try {
    const inventory = await Inventory.find().populate(
      "performedBy",
      "name email"
    );
    res.json({ success: true, data: inventory });
  } catch (err) {
    res
      .status(500)
      .json({ success: false, message: "Failed to fetch inventory." });
  }
});

// Add new inventory item
router.post("/", protect, admin, async (req, res) => {
  try {
    const { SKU, productName, quantity, lowStockThreshold } = req.body;
    const newItem = new Inventory({
      SKU,
      productName,
      quantity,
      lowStockThreshold,
    });
    await newItem.save();
    res.status(201).json({ success: true, data: newItem });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// Add stock
router.post("/:sku/restock", protect, admin, async (req, res) => {
  try {
    const { quantity, notes } = req.body;
    const item = await Inventory.findOne({ SKU: req.params.sku });

    if (!item)
      return res
        .status(404)
        .json({ success: false, message: "Item not found" });

    await item.addStock(quantity, notes, req.userId);
    res.json({ success: true, message: "Stock added", data: item });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;

const Discount = require("../models/discount");

// GET /api/discount
exports.getAllDiscounts = async (req, res) => {
  try {
    const discounts = await Discount.find();
    res.json({ discount: discounts });
  } catch (err) {
    res.status(500).json({ message: "Error fetching discounts." });
  }
};

// POST /api/discount
exports.createDiscount = async (req, res) => {
  try {
    const discount = new Discount(req.body);
    await discount.save();
    res.status(201).json({ message: "Discount created successfully." });
  } catch (err) {
    res.status(500).json({ message: "Error creating discount." });
  }
};

// DELETE /api/discount/:id
exports.deleteDiscount = async (req, res) => {
  try {
    await Discount.findByIdAndDelete(req.params.id);
    res.json({ message: "Discount deleted successfully." });
  } catch (err) {
    res.status(500).json({ message: "Error deleting discount." });
  }
};

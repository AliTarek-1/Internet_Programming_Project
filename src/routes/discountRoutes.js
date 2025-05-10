const express = require("express");
const router = express.Router();
const discountController = require("../controllers/discountController");

// GET all discounts
router.get("/", discountController.getAllDiscounts);

// POST a new discount
router.post("/", discountController.createDiscount);

// DELETE a discount by ID
router.delete("/:id", discountController.deleteDiscount);

module.exports = router;

const express = require("express");
const router = express.Router();
const { 
  getAllProducts, 
  getProductById, 
  createProduct, 
  updateProduct, 
  deleteProduct,
  getFeaturedProducts,
  getProductsByCategory
} = require("../controllers/productController");
const { verifyToken, restrictTo } = require("../controllers/verifyToken");

// Public routes
router.get("/featured", getFeaturedProducts);
router.get("/category/:category", getProductsByCategory);
router.get("/", getAllProducts);
router.get("/:id", getProductById);

// Protected routes - only admins can create, update, delete products
router.post("/", verifyToken, restrictTo('admin'), createProduct);
router.put("/:id", verifyToken, restrictTo('admin'), updateProduct);
router.delete("/:id", verifyToken, restrictTo('admin'), deleteProduct);

module.exports = router;

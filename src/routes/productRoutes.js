const express = require("express");
const router = express.Router();
const productController = require("../controllers/productController");
const verifyToken = require("../controllers/verifyToken");

const isAdmin = (req, res, next) => {
  if (req.userRole !== "admin") {
    return res.status(403).json({ message: "Forbidden: Admins only" });
  }
  next();
};

router.get("/", productController.getAllProducts);
router.get("/:id", productController.getProductById);

router.post("/", verifyToken, isAdmin, productController.createProduct);
router.put("/:id", verifyToken, isAdmin, productController.updateProduct);
router.delete("/:id", verifyToken, isAdmin, productController.deleteProduct);

module.exports = router;

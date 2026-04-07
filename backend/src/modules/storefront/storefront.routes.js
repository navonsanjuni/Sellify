const express = require("express");
const router = express.Router();
const storefrontController = require("./storefront.controller");

// All routes are public (no auth required)
router.get("/products", storefrontController.getProducts);
router.get("/products/featured", storefrontController.getFeaturedProducts);
router.get("/products/:id", storefrontController.getProductById);
router.get("/categories", storefrontController.getCategories);

module.exports = router;

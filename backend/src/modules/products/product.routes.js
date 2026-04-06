const express = require("express");
const router = express.Router();
const productController = require("./product.controller");
const { protect, authorize } = require("../../middlewares/auth.middleware");
const validate = require("../../middlewares/validate.middleware");
const upload = require("../../middlewares/upload.middleware");
const { createProductSchema, updateProductSchema, adjustStockSchema } = require("./product.validation");

router.use(protect);

router.get("/", productController.getAllProducts);
router.get("/:id", productController.getProductById);
router.post("/", authorize("admin"), upload.array("images", 5), validate(createProductSchema), productController.createProduct);
router.put("/:id", authorize("admin"), upload.array("images", 5), validate(updateProductSchema), productController.updateProduct);
router.delete("/:id", authorize("admin"), productController.deleteProduct);
router.patch("/:id/stock", authorize("admin"), validate(adjustStockSchema), productController.adjustStock);

module.exports = router;
 
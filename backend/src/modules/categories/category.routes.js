const express = require("express");
const router = express.Router();
const categoryController = require("./category.controller");
const { protect, authorize } = require("../../middlewares/auth.middleware");
const validate = require("../../middlewares/validate.middleware");
const upload = require("../../middlewares/upload.middleware");
const { createCategorySchema, updateCategorySchema } = require("./category.validation");

// ─── Public Storefront Route (no auth) ───────────────────────────────────────
router.get("/public", categoryController.getPublicCategories);

// ─── Admin/Staff Routes (protected) ─────────────────────────────────────────
router.use(protect);
router.get("/", categoryController.getAllCategories);
router.get("/:id", categoryController.getCategoryById);
router.post("/", authorize("admin"), upload.single("image"), validate(createCategorySchema), categoryController.createCategory);
router.put("/:id", authorize("admin"), upload.single("image"), validate(updateCategorySchema), categoryController.updateCategory);
router.delete("/:id", authorize("admin"), categoryController.deleteCategory);

module.exports = router;

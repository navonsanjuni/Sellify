const express = require("express");
const router = express.Router();
const authController = require("./auth.controller");
const { protect, authorize } = require("../../middlewares/auth.middleware");
const validate = require("../../middlewares/validate.middleware");
const { registerSchema, loginSchema, refreshSchema } = require("./auth.validation");

// Public routes
router.post("/login", validate(loginSchema), authController.login);
router.post("/refresh", validate(refreshSchema), authController.refresh);

// Protected routes
router.post("/register", protect, authorize("admin"), validate(registerSchema), authController.register);
router.post("/logout", protect, authController.logout);
router.get("/me", protect, authController.getMe);

module.exports = router;

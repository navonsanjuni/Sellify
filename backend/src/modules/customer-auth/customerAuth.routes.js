const express = require("express");
const router = express.Router();
const customerAuthController = require("./customerAuth.controller");
const { protectCustomer } = require("../../middlewares/auth.middleware");
const validate = require("../../middlewares/validate.middleware");
const {
  registerSchema,
  loginSchema,
  refreshSchema,
  updateProfileSchema,
  changePasswordSchema,
} = require("./customerAuth.validation");

// Public routes
router.post("/register", validate(registerSchema), customerAuthController.register);
router.post("/login", validate(loginSchema), customerAuthController.login);
router.post("/refresh", validate(refreshSchema), customerAuthController.refresh);

// Protected routes (customer only)
router.post("/logout", protectCustomer, customerAuthController.logout);
router.get("/me", protectCustomer, customerAuthController.getMe);
router.put("/profile", protectCustomer, validate(updateProfileSchema), customerAuthController.updateProfile);
router.put("/change-password", protectCustomer, validate(changePasswordSchema), customerAuthController.changePassword);

module.exports = router;

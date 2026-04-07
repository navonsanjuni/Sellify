const express = require("express");
const router = express.Router();
const customerController = require("./customer.controller");
const { protect, protectCustomer } = require("../../middlewares/auth.middleware");
const validate = require("../../middlewares/validate.middleware");
const {
  createCustomerSchema, updateCustomerSchema,
  registerSchema, loginSchema, refreshSchema, updateProfileSchema, changePasswordSchema,
} = require("./customer.validation");

// ─── Customer Auth (public + customer-protected) ─────────────────────────────
router.post("/auth/register", validate(registerSchema), customerController.register);
router.post("/auth/login", validate(loginSchema), customerController.login);
router.post("/auth/refresh", validate(refreshSchema), customerController.refresh);
router.post("/auth/logout", protectCustomer, customerController.logout);
router.get("/auth/me", protectCustomer, customerController.getMe);
router.put("/auth/profile", protectCustomer, validate(updateProfileSchema), customerController.updateProfile);
router.put("/auth/change-password", protectCustomer, validate(changePasswordSchema), customerController.changePassword);

// ─── Admin CRUD (staff/admin manages customers) ─────────────────────────────
router.use(protect);
router.get("/", customerController.getAllCustomers);
router.get("/:id", customerController.getCustomerById);
router.post("/", validate(createCustomerSchema), customerController.createCustomer);
router.put("/:id", validate(updateCustomerSchema), customerController.updateCustomer);
router.delete("/:id", customerController.deleteCustomer);

module.exports = router;

const express = require("express");
const router = express.Router();
const userController = require("./user.controller");
const { protect, authorize } = require("../../middlewares/auth.middleware");
const validate = require("../../middlewares/validate.middleware");
const { updateUserSchema, changePasswordSchema } = require("./user.validation");

// All user routes require authentication
router.use(protect);

router.get("/", authorize("admin"), userController.getAllUsers);
router.get("/:id", userController.getUserById);
router.put("/:id", validate(updateUserSchema), userController.updateUser);
router.delete("/:id", authorize("admin"), userController.deleteUser);
router.put("/:id/change-password", validate(changePasswordSchema), userController.changePassword);

module.exports = router;

const express = require("express");
const router = express.Router();
const orderController = require("./order.controller");
const { protect } = require("../../middlewares/auth.middleware");
const validate = require("../../middlewares/validate.middleware");
const { createOrderSchema, updatePaymentSchema, updateOrderStatusSchema } = require("./order.validation");
const { authorize } = require("../../middlewares/auth.middleware");

router.use(protect);

router.get("/", orderController.getAllOrders);
router.post("/", validate(createOrderSchema), orderController.createOrder);
router.get("/:id", orderController.getOrderById);
router.patch("/:id/payment", validate(updatePaymentSchema), orderController.updatePaymentStatus);
router.patch("/:id/status", authorize("admin", "staff"), validate(updateOrderStatusSchema), orderController.updateOrderStatus);

module.exports = router;

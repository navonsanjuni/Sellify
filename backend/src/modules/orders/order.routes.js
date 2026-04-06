const express = require("express");
const router = express.Router();
const orderController = require("./order.controller");
const { protect } = require("../../middlewares/auth.middleware");
const validate = require("../../middlewares/validate.middleware");
const { createOrderSchema, updatePaymentSchema } = require("./order.validation");

router.use(protect);

router.get("/", orderController.getAllOrders);
router.post("/", validate(createOrderSchema), orderController.createOrder);
router.get("/:id", orderController.getOrderById);
router.patch("/:id/payment", validate(updatePaymentSchema), orderController.updatePaymentStatus);

module.exports = router;

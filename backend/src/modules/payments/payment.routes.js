const express = require("express");
const router = express.Router();
const paymentController = require("./payment.controller");
const { protect, authorize } = require("../../middlewares/auth.middleware");
const { validate } = require("../../middlewares/validate.middleware");
const { createPaymentSchema } = require("./payment.validation");

router.use(protect);

router.get("/", authorize("admin"), paymentController.getAllPayments);
router.post("/", validate(createPaymentSchema), paymentController.createPayment);
router.get("/order/:orderId", paymentController.getPaymentsByOrder);

module.exports = router;

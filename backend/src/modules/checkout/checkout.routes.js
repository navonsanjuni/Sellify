const express = require("express");
const router = express.Router();
const checkoutController = require("./checkout.controller");
const { protectCustomer } = require("../../middlewares/auth.middleware");
const validate = require("../../middlewares/validate.middleware");
const { createSessionSchema } = require("./checkout.validation");

// Stripe webhook (no auth — verified by Stripe signature)
router.post("/webhook", checkoutController.webhook);

// Protected routes (customer only)
router.post("/create-session", protectCustomer, validate(createSessionSchema), checkoutController.createSession);
router.get("/session/:sessionId", protectCustomer, checkoutController.getSessionStatus);

module.exports = router;

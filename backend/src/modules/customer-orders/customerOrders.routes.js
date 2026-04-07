const express = require("express");
const router = express.Router();
const customerOrdersController = require("./customerOrders.controller");
const { protectCustomer } = require("../../middlewares/auth.middleware");

// All routes require customer authentication
router.use(protectCustomer);

router.get("/", customerOrdersController.getMyOrders);
router.get("/:id", customerOrdersController.getMyOrderById);

module.exports = router;

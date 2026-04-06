const express = require("express");
const router = express.Router();
const customerController = require("./customer.controller");
const { protect } = require("../../middlewares/auth.middleware");
const validate = require("../../middlewares/validate.middleware");
const { createCustomerSchema, updateCustomerSchema } = require("./customer.validation");

router.use(protect);

router.get("/", customerController.getAllCustomers);
router.get("/:id", customerController.getCustomerById);
router.post("/", validate(createCustomerSchema), customerController.createCustomer);
router.put("/:id", validate(updateCustomerSchema), customerController.updateCustomer);
router.delete("/:id", customerController.deleteCustomer);

module.exports = router;

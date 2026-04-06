const Joi = require("joi");

const orderItemSchema = Joi.object({
  productId: Joi.string().hex().length(24).required().messages({
    "string.length": "Invalid product ID",
  }),
  quantity: Joi.number().integer().min(1).required(),
});

const createOrderSchema = Joi.object({
  customerId: Joi.string().hex().length(24).allow(null, ""),
  items: Joi.array().items(orderItemSchema).min(1).required().messages({
    "array.min": "Order must have at least one item",
  }),
  discount: Joi.number().min(0).default(0),
  tax: Joi.number().min(0).default(0),
  paymentMethod: Joi.string().valid("cash", "card", "online", "none").default("none"),
  amountPaid: Joi.number().min(0).default(0),
  notes: Joi.string().trim().max(300).allow("", null),
});

const updatePaymentSchema = Joi.object({
  paymentStatus: Joi.string().valid("paid", "unpaid", "partial"),
  paymentMethod: Joi.string().valid("cash", "card", "online", "none"),
  amountPaid: Joi.number().min(0),
});

module.exports = { createOrderSchema, updatePaymentSchema };

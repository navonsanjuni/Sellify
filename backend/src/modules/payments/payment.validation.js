const Joi = require("joi");

const createPaymentSchema = Joi.object({
  orderId: Joi.string().hex().length(24).required(),
  amount: Joi.number().positive().required(),
  method: Joi.string().valid("cash", "card", "transfer", "stripe").required(),
  transactionId: Joi.string().optional().allow("", null),
  notes: Joi.string().optional().allow("", null),
});

module.exports = { createPaymentSchema };

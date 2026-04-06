const Joi = require("joi");

const addressSchema = Joi.object({
  street: Joi.string().trim().allow("", null),
  city: Joi.string().trim().allow("", null),
  state: Joi.string().trim().allow("", null),
  zipCode: Joi.string().trim().allow("", null),
});

const createCustomerSchema = Joi.object({
  name: Joi.string().trim().max(80).required(),
  email: Joi.string().email().lowercase().trim().allow("", null),
  phone: Joi.string().trim().max(20).allow("", null),
  address: addressSchema,
  notes: Joi.string().trim().max(300).allow("", null),
  isActive: Joi.boolean(),
});

const updateCustomerSchema = Joi.object({
  name: Joi.string().trim().max(80),
  email: Joi.string().email().lowercase().trim().allow("", null),
  phone: Joi.string().trim().max(20).allow("", null),
  address: addressSchema,
  notes: Joi.string().trim().max(300).allow("", null),
  isActive: Joi.boolean(),
});

module.exports = { createCustomerSchema, updateCustomerSchema };

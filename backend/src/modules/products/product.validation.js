const Joi = require("joi");

const createProductSchema = Joi.object({
  name: Joi.string().trim().max(100).required(),
  description: Joi.string().trim().max(500).allow("", null),
  sku: Joi.string().trim().uppercase().allow("", null),
  price: Joi.number().min(0).required(),
  costPrice: Joi.number().min(0),
  category: Joi.string().hex().length(24).required().messages({
    "string.length": "Invalid category ID",
  }),
  stock: Joi.number().min(0).default(0),
  lowStockThreshold: Joi.number().min(0).default(5),
  unit: Joi.string().trim().default("pcs"),
  isActive: Joi.boolean(),
});

const updateProductSchema = Joi.object({
  name: Joi.string().trim().max(100),
  description: Joi.string().trim().max(500).allow("", null),
  sku: Joi.string().trim().uppercase().allow("", null),
  price: Joi.number().min(0),
  costPrice: Joi.number().min(0),
  category: Joi.string().hex().length(24),
  stock: Joi.number().min(0),
  lowStockThreshold: Joi.number().min(0),
  unit: Joi.string().trim(),
  isActive: Joi.boolean(),
});

const adjustStockSchema = Joi.object({
  quantity: Joi.number().required().messages({
    "number.base": "Quantity must be a number (positive to add, negative to deduct)",
  }),
});

module.exports = { createProductSchema, updateProductSchema, adjustStockSchema };

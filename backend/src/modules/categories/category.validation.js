const Joi = require("joi");

const createCategorySchema = Joi.object({
  name: Joi.string().trim().max(50).required(),
  description: Joi.string().trim().max(200).allow("", null),
  isActive: Joi.boolean(),
});

const updateCategorySchema = Joi.object({
  name: Joi.string().trim().max(50),
  description: Joi.string().trim().max(200).allow("", null),
  isActive: Joi.boolean(),
});

module.exports = { createCategorySchema, updateCategorySchema };

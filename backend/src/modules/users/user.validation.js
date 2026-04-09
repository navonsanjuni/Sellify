const Joi = require("joi");

const updateUserSchema = Joi.object({
  name: Joi.string().trim().max(50),
  email: Joi.string().email().lowercase().trim(),
  role: Joi.string().valid("admin", "staff"),
  isActive: Joi.boolean(),
});

const changePasswordSchema = Joi.object({
  currentPassword: Joi.string().required(),
  newPassword: Joi.string().min(6).required(),
});

module.exports = { updateUserSchema, changePasswordSchema };

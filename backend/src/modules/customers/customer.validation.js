const Joi = require("joi");

const addressSchema = Joi.object({
  street: Joi.string().trim().allow("", null),
  city: Joi.string().trim().allow("", null),
  state: Joi.string().trim().allow("", null),
  zipCode: Joi.string().trim().allow("", null),
});

// ─── Admin CRUD Schemas ──────────────────────────────────────────────────────

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

// ─── Customer Auth Schemas ───────────────────────────────────────────────────

const registerSchema = Joi.object({
  name: Joi.string().trim().max(80).required(),
  email: Joi.string().email().lowercase().trim().required(),
  password: Joi.string().min(6).max(100).required(),
  phone: Joi.string().trim().max(20).allow("", null),
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

const refreshSchema = Joi.object({
  refreshToken: Joi.string().required(),
});

const updateProfileSchema = Joi.object({
  name: Joi.string().trim().max(80),
  phone: Joi.string().trim().max(20).allow("", null),
  address: addressSchema,
});

const changePasswordSchema = Joi.object({
  currentPassword: Joi.string().required(),
  newPassword: Joi.string().min(6).max(100).required(),
});

module.exports = {
  createCustomerSchema, updateCustomerSchema,
  registerSchema, loginSchema, refreshSchema, updateProfileSchema, changePasswordSchema,
};

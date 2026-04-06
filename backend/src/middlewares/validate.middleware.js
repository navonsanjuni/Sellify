const ApiError = require("../utils/ApiError");

/**
 * Joi validation middleware factory
 * Usage: validate(myJoiSchema) — pass as route middleware
 * Validates req.body against the provided Joi schema
 */
const validate = (schema) => (req, res, next) => {
  const { error, value } = schema.validate(req.body, {
    abortEarly: false,    // collect ALL errors, not just first
    stripUnknown: true,   // remove unknown fields from body
  });

  if (error) {
    const errors = error.details.map((detail) => detail.message);
    return next(ApiError.badRequest("Validation failed", errors));
  }

  // Replace req.body with sanitized value (unknown fields stripped)
  req.body = value;
  next();
};

module.exports = validate;

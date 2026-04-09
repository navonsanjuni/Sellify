const ApiError = require("../utils/ApiError");
const logger = require("../utils/logger");

/**
 * Global error handling middleware
 * Must be registered LAST in app.js with 4 parameters
 */
// eslint-disable-next-line no-unused-vars
const errorMiddleware = (err, req, res, next) => {
  // Log every error
  logger.error(`${err.message}`, { stack: err.stack });

  // Handle known JWT errors
  if (err.name === "JsonWebTokenError") {
    return res.status(401).json({
      success: false,
      statusCode: 401,
      message: "Invalid token. Please log in again.",
    });
  }

  if (err.name === "TokenExpiredError") {
    return res.status(401).json({
      success: false,
      statusCode: 401,
      message: "Token expired. Please log in again.",
    });
  }

  // Handle Mongoose CastError (invalid ObjectId)
  if (err.name === "CastError") {
    return res.status(400).json({
      success: false,
      statusCode: 400,
      message: `Invalid ID format: ${err.value}`,
    });
  }

  // Handle Mongoose duplicate key error
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    return res.status(409).json({
      success: false,
      statusCode: 409,
      message: `${field} already exists.`,
    });
  }

  // Handle Mongoose validation error
  if (err.name === "ValidationError") {
    const errors = Object.values(err.errors).map((e) => e.message);
    return res.status(400).json({
      success: false,
      statusCode: 400,
      message: "Validation failed",
      errors,
    });
  }

  // Handle our custom ApiError
  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({
      success: false,
      statusCode: err.statusCode,
      message: err.message,
      errors: err.errors,
    });
  }

  // Fallback: unexpected error (don't leak details in production)
  const statusCode = err.statusCode || 500;
  const message =
    process.env.NODE_ENV === "production"
      ? "Internal server error"
      : err.message;

  return res.status(statusCode).json({
    success: false,
    statusCode,
    message,
  });
};

module.exports = errorMiddleware;

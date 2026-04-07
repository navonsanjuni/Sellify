const { verifyAccessToken } = require("../utils/generateToken");
const ApiError = require("../utils/ApiError");
const asyncHandler = require("../utils/asyncHandler");
const User = require("../modules/users/user.model");
const Customer = require("../modules/customers/customer.model");

/**
 * Extract Bearer token from Authorization header
 */
const extractToken = (req) => {
  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer ")) {
    return req.headers.authorization.split(" ")[1];
  }
  return null;
};

/**
 * Verify JWT and attach admin/staff user to req.user
 */
const protect = asyncHandler(async (req, res, next) => {
  const token = extractToken(req);
  if (!token) throw ApiError.unauthorized("No token provided. Please log in.");

  const decoded = verifyAccessToken(token);

  // Reject customer tokens on admin/staff routes
  if (decoded.type === "customer") {
    throw ApiError.unauthorized("Access denied. Admin or staff login required.");
  }

  const user = await User.findById(decoded.id).select("-password -refreshToken");
  if (!user) throw ApiError.unauthorized("User no longer exists.");
  if (!user.isActive) throw ApiError.forbidden("Your account has been deactivated.");

  req.user = user;
  next();
});

/**
 * Verify JWT and attach customer to req.customer
 */
const protectCustomer = asyncHandler(async (req, res, next) => {
  const token = extractToken(req);
  if (!token) throw ApiError.unauthorized("No token provided. Please log in.");

  const decoded = verifyAccessToken(token);

  if (decoded.type !== "customer") {
    throw ApiError.unauthorized("Access denied. Customer login required.");
  }

  const customer = await Customer.findById(decoded.id);
  if (!customer) throw ApiError.unauthorized("Customer no longer exists.");
  if (!customer.isActive) throw ApiError.forbidden("Your account has been deactivated.");

  req.customer = customer;
  next();
});

/**
 * Role-based access control for admin/staff
 * Usage: authorize("admin") or authorize("admin", "staff")
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        ApiError.forbidden(
          `Access denied. Required role: ${roles.join(" or ")}`
        )
      );
    }
    next();
  };
};

module.exports = { protect, protectCustomer, authorize };

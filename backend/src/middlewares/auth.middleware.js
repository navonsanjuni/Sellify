const { verifyAccessToken } = require("../utils/generateToken");
const ApiError = require("../utils/ApiError");
const asyncHandler = require("../utils/asyncHandler");
const User = require("../modules/users/user.model");

/**
 * Verify JWT and attach user to req.user
 */
const protect = asyncHandler(async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer ")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    throw ApiError.unauthorized("No token provided. Please log in.");
  }

  const decoded = verifyAccessToken(token);
  const user = await User.findById(decoded.id).select("-password -refreshToken");

  if (!user) {
    throw ApiError.unauthorized("User no longer exists.");
  }

  if (!user.isActive) {
    throw ApiError.forbidden("Your account has been deactivated.");
  }

  req.user = user;
  next();
});

/**
 * Role-based access control
 * Usage: authorize("admin") or authorize("admin", "staff")
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      throw ApiError.forbidden(
        `Access denied. Required role: ${roles.join(" or ")}`
      );
    }
    next();
  };
};

module.exports = { protect, authorize };

const User = require("../users/user.model");
const ApiError = require("../../utils/ApiError");
const { generateTokenPair, verifyRefreshToken } = require("../../utils/generateToken");

/**
 * Register a new user (admin creates staff accounts)
 */
const register = async (data) => {
  const existing = await User.findOne({ email: data.email });
  if (existing) throw ApiError.conflict("Email already registered");

  const user = await User.create(data);
  return { user };
};

/**
 * Login user — returns access + refresh token pair
 */
const login = async (email, password) => {
  const user = await User.findOne({ email }).select("+password");

  if (!user || !(await user.comparePassword(password))) {
    throw ApiError.unauthorized("Invalid email or password");
  }

  if (!user.isActive) {
    throw ApiError.forbidden("Account deactivated. Contact admin.");
  }

  const tokens = generateTokenPair({ id: user._id, role: user.role });

  // Store hashed refresh token in DB
  user.refreshToken = tokens.refreshToken;
  user.lastLogin = new Date();
  await user.save({ validateBeforeSave: false });

  // Return user without sensitive fields
  user.password = undefined;
  user.refreshToken = undefined;

  return { user, ...tokens };
};

/**
 * Refresh access token using valid refresh token
 */
const refreshTokens = async (incomingRefreshToken) => {
  if (!incomingRefreshToken) throw ApiError.unauthorized("No refresh token");

  const decoded = verifyRefreshToken(incomingRefreshToken);
  const user = await User.findById(decoded.id).select("+refreshToken");

  if (!user || user.refreshToken !== incomingRefreshToken) {
    throw ApiError.unauthorized("Invalid or expired refresh token");
  }

  const tokens = generateTokenPair({ id: user._id, role: user.role });
  user.refreshToken = tokens.refreshToken;
  await user.save({ validateBeforeSave: false });

  return tokens;
};

/**
 * Logout — clear refresh token from DB
 */
const logout = async (userId) => {
  await User.findByIdAndUpdate(userId, { refreshToken: null });
  return { message: "Logged out successfully" };
};

/**
 * Get current authenticated user profile
 */
const getMe = async (userId) => {
  const user = await User.findById(userId);
  if (!user) throw ApiError.notFound("User not found");
  return { user };
};

module.exports = { register, login, refreshTokens, logout, getMe };

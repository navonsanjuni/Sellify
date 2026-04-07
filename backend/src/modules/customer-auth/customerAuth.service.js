const Customer = require("../customers/customer.model");
const ApiError = require("../../utils/ApiError");
const { generateTokenPair, verifyRefreshToken } = require("../../utils/generateToken");

const register = async (data) => {
  const existing = await Customer.findOne({ email: data.email });
  if (existing) throw ApiError.conflict("Email already registered");

  const customer = await Customer.create({
    name: data.name,
    email: data.email,
    password: data.password,
    phone: data.phone || null,
  });

  const tokens = generateTokenPair({ id: customer._id, type: "customer" });

  customer.refreshToken = tokens.refreshToken;
  await customer.save({ validateBeforeSave: false });

  customer.password = undefined;
  customer.refreshToken = undefined;

  return { customer, ...tokens };
};

const login = async (email, password) => {
  const customer = await Customer.findOne({ email }).select("+password");

  if (!customer || !customer.password) {
    throw ApiError.unauthorized("Invalid email or password");
  }

  if (!(await customer.comparePassword(password))) {
    throw ApiError.unauthorized("Invalid email or password");
  }

  if (!customer.isActive) {
    throw ApiError.forbidden("Account deactivated. Contact support.");
  }

  const tokens = generateTokenPair({ id: customer._id, type: "customer" });

  customer.refreshToken = tokens.refreshToken;
  await customer.save({ validateBeforeSave: false });

  customer.password = undefined;
  customer.refreshToken = undefined;

  return { customer, ...tokens };
};

const refreshTokens = async (incomingRefreshToken) => {
  if (!incomingRefreshToken) throw ApiError.unauthorized("No refresh token");

  const decoded = verifyRefreshToken(incomingRefreshToken);
  if (decoded.type !== "customer") throw ApiError.unauthorized("Invalid token type");

  const customer = await Customer.findById(decoded.id).select("+refreshToken");

  if (!customer || customer.refreshToken !== incomingRefreshToken) {
    throw ApiError.unauthorized("Invalid or expired refresh token");
  }

  const tokens = generateTokenPair({ id: customer._id, type: "customer" });
  customer.refreshToken = tokens.refreshToken;
  await customer.save({ validateBeforeSave: false });

  return tokens;
};

const logout = async (customerId) => {
  await Customer.findByIdAndUpdate(customerId, { refreshToken: null });
  return { message: "Logged out successfully" };
};

const getMe = async (customerId) => {
  const customer = await Customer.findById(customerId);
  if (!customer) throw ApiError.notFound("Customer not found");
  return { customer };
};

const updateProfile = async (customerId, data) => {
  const customer = await Customer.findByIdAndUpdate(customerId, data, {
    new: true,
    runValidators: true,
  });
  if (!customer) throw ApiError.notFound("Customer not found");
  return { customer };
};

const changePassword = async (customerId, currentPassword, newPassword) => {
  const customer = await Customer.findById(customerId).select("+password");
  if (!customer) throw ApiError.notFound("Customer not found");

  if (!(await customer.comparePassword(currentPassword))) {
    throw ApiError.badRequest("Current password is incorrect");
  }

  customer.password = newPassword;
  await customer.save();

  customer.password = undefined;
  return { message: "Password changed successfully" };
};

module.exports = { register, login, refreshTokens, logout, getMe, updateProfile, changePassword };

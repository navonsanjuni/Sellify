const Customer = require("./customer.model");
const ApiError = require("../../utils/ApiError");
const { generateTokenPair, verifyRefreshToken } = require("../../utils/generateToken");

// ─── Admin CRUD (staff/admin manages customers) ─────────────────────────────

const getAllCustomers = async (query = {}) => {
  const { page = 1, limit = 20, search, isActive } = query;
  const skip = (page - 1) * limit;
  const filter = {};

  if (isActive !== undefined) filter.isActive = isActive === "true";
  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: "i" } },
      { email: { $regex: search, $options: "i" } },
      { phone: { $regex: search, $options: "i" } },
    ];
  }

  const [customers, total] = await Promise.all([
    Customer.find(filter).skip(skip).limit(Number(limit)).sort({ name: 1 }),
    Customer.countDocuments(filter),
  ]);

  return { customers, pagination: { total, page: Number(page), limit: Number(limit), totalPages: Math.ceil(total / limit) } };
};

const getCustomerById = async (id) => {
  const customer = await Customer.findById(id);
  if (!customer) throw ApiError.notFound("Customer not found");
  return customer;
};

const createCustomer = async (data) => {
  const customer = await Customer.create(data);
  return customer;
};

const updateCustomer = async (id, data) => {
  const customer = await Customer.findByIdAndUpdate(id, data, { new: true, runValidators: true });
  if (!customer) throw ApiError.notFound("Customer not found");
  return customer;
};

const deleteCustomer = async (id) => {
  const customer = await Customer.findByIdAndUpdate(id, { isActive: false }, { new: true });
  if (!customer) throw ApiError.notFound("Customer not found");
  return customer;
};

// ─── Customer Auth (customer registers/logins themselves) ────────────────────

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

module.exports = {
  // Admin CRUD
  getAllCustomers, getCustomerById, createCustomer, updateCustomer, deleteCustomer,
  // Customer Auth
  register, login, refreshTokens, logout, getMe, updateProfile, changePassword,
};

const customerService = require("./customer.service");
const asyncHandler = require("../../utils/asyncHandler");
const { sendResponse } = require("../../utils/ApiResponse");

// ─── Admin CRUD ──────────────────────────────────────────────────────────────

const getAllCustomers = asyncHandler(async (req, res) => {
  const result = await customerService.getAllCustomers(req.query);
  sendResponse(res, 200, result, "Customers retrieved successfully");
});

const getCustomerById = asyncHandler(async (req, res) => {
  const customer = await customerService.getCustomerById(req.params.id);
  sendResponse(res, 200, { customer }, "Customer retrieved successfully");
});

const createCustomer = asyncHandler(async (req, res) => {
  const customer = await customerService.createCustomer(req.body);
  sendResponse(res, 201, { customer }, "Customer created successfully");
});

const updateCustomer = asyncHandler(async (req, res) => {
  const customer = await customerService.updateCustomer(req.params.id, req.body);
  sendResponse(res, 200, { customer }, "Customer updated successfully");
});

const deleteCustomer = asyncHandler(async (req, res) => {
  await customerService.deleteCustomer(req.params.id);
  sendResponse(res, 200, null, "Customer deactivated successfully");
});

// ─── Customer Auth ───────────────────────────────────────────────────────────

const register = asyncHandler(async (req, res) => {
  const result = await customerService.register(req.body);
  sendResponse(res, 201, result, "Registration successful");
});

const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const result = await customerService.login(email, password);
  sendResponse(res, 200, result, "Login successful");
});

const refresh = asyncHandler(async (req, res) => {
  const { refreshToken } = req.body;
  const tokens = await customerService.refreshTokens(refreshToken);
  sendResponse(res, 200, tokens, "Tokens refreshed");
});

const logout = asyncHandler(async (req, res) => {
  const result = await customerService.logout(req.customer._id);
  sendResponse(res, 200, result, "Logged out successfully");
});

const getMe = asyncHandler(async (req, res) => {
  const result = await customerService.getMe(req.customer._id);
  sendResponse(res, 200, result, "Profile retrieved");
});

const updateProfile = asyncHandler(async (req, res) => {
  const result = await customerService.updateProfile(req.customer._id, req.body);
  sendResponse(res, 200, result, "Profile updated");
});

const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const result = await customerService.changePassword(req.customer._id, currentPassword, newPassword);
  sendResponse(res, 200, result, "Password changed");
});

module.exports = {
  // Admin CRUD
  getAllCustomers, getCustomerById, createCustomer, updateCustomer, deleteCustomer,
  // Customer Auth
  register, login, refresh, logout, getMe, updateProfile, changePassword,
};

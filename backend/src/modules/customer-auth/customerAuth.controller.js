const customerAuthService = require("./customerAuth.service");
const asyncHandler = require("../../utils/asyncHandler");
const { sendResponse } = require("../../utils/ApiResponse");

const register = asyncHandler(async (req, res) => {
  const result = await customerAuthService.register(req.body);
  sendResponse(res, 201, result, "Registration successful");
});

const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const result = await customerAuthService.login(email, password);
  sendResponse(res, 200, result, "Login successful");
});

const refresh = asyncHandler(async (req, res) => {
  const { refreshToken } = req.body;
  const tokens = await customerAuthService.refreshTokens(refreshToken);
  sendResponse(res, 200, tokens, "Tokens refreshed");
});

const logout = asyncHandler(async (req, res) => {
  const result = await customerAuthService.logout(req.customer._id);
  sendResponse(res, 200, result, "Logged out successfully");
});

const getMe = asyncHandler(async (req, res) => {
  const result = await customerAuthService.getMe(req.customer._id);
  sendResponse(res, 200, result, "Profile retrieved");
});

const updateProfile = asyncHandler(async (req, res) => {
  const result = await customerAuthService.updateProfile(req.customer._id, req.body);
  sendResponse(res, 200, result, "Profile updated");
});

const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const result = await customerAuthService.changePassword(req.customer._id, currentPassword, newPassword);
  sendResponse(res, 200, result, "Password changed");
});

module.exports = { register, login, refresh, logout, getMe, updateProfile, changePassword };

const authService = require("./auth.service");
const asyncHandler = require("../../utils/asyncHandler");
const { sendResponse } = require("../../utils/ApiResponse");

const register = asyncHandler(async (req, res) => {
  const result = await authService.register(req.body);
  sendResponse(res, 201, result, "User registered successfully");
});

const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const result = await authService.login(email, password);
  sendResponse(res, 200, result, "Login successful");
});

const refresh = asyncHandler(async (req, res) => {
  const { refreshToken } = req.body;
  const tokens = await authService.refreshTokens(refreshToken);
  sendResponse(res, 200, tokens, "Tokens refreshed");
});

const logout = asyncHandler(async (req, res) => {
  const result = await authService.logout(req.user._id);
  sendResponse(res, 200, result, "Logged out successfully");
});

const getMe = asyncHandler(async (req, res) => {
  const result = await authService.getMe(req.user._id);
  sendResponse(res, 200, result, "Profile retrieved");
});

module.exports = { register, login, refresh, logout, getMe };

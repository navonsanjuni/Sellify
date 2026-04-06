const userService = require("./user.service");
const asyncHandler = require("../../utils/asyncHandler");
const { sendResponse } = require("../../utils/ApiResponse");

const getAllUsers = asyncHandler(async (req, res) => {
  const result = await userService.getAllUsers(req.query);
  sendResponse(res, 200, result, "Users retrieved successfully");
});

const getUserById = asyncHandler(async (req, res) => {
  const user = await userService.getUserById(req.params.id);
  sendResponse(res, 200, { user }, "User retrieved successfully");
});

const updateUser = asyncHandler(async (req, res) => {
  // Staff can only update themselves; admin can update anyone
  if (req.user.role !== "admin" && req.params.id !== req.user.id) {
    return sendResponse(res, 403, null, "Access denied");
  }
  // Staff cannot change their own role
  if (req.user.role !== "admin") delete req.body.role;

  const user = await userService.updateUser(req.params.id, req.body);
  sendResponse(res, 200, { user }, "User updated successfully");
});

const deleteUser = asyncHandler(async (req, res) => {
  await userService.deleteUser(req.params.id, req.user._id);
  sendResponse(res, 200, null, "User deactivated successfully");
});

const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const result = await userService.changePassword(
    req.user._id,
    currentPassword,
    newPassword
  );
  sendResponse(res, 200, result, "Password changed successfully");
});

module.exports = { getAllUsers, getUserById, updateUser, deleteUser, changePassword };

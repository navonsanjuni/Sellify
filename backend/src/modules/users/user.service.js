const User = require("./user.model");
const ApiError = require("../../utils/ApiError");

/**
 * Get all users (admin only)
 */
const getAllUsers = async (query = {}) => {
  const { page = 1, limit = 10, role, isActive, search } = query;
  const skip = (page - 1) * limit;

  const filter = {};
  if (role) filter.role = role;
  if (isActive !== undefined) filter.isActive = isActive === "true";
  if (search) filter.name = { $regex: search, $options: "i" };

  const [users, total] = await Promise.all([
    User.find(filter).skip(skip).limit(Number(limit)).sort({ createdAt: -1 }),
    User.countDocuments(filter),
  ]);

  return {
    users,
    pagination: {
      total,
      page: Number(page),
      limit: Number(limit),
      totalPages: Math.ceil(total / limit),
    },
  };
};

/**
 * Get single user by ID
 */
const getUserById = async (id) => {
  const user = await User.findById(id);
  if (!user) throw ApiError.notFound("User not found");
  return user;
};

/**
 * Update user profile
 */
const updateUser = async (id, updateData) => {
  // Prevent role escalation unless done by admin (handled in controller)
  const user = await User.findByIdAndUpdate(id, updateData, {
    new: true,
    runValidators: true,
  });
  if (!user) throw ApiError.notFound("User not found");
  return user;
};

/**
 * Deactivate (soft delete) a user
 */
const deleteUser = async (id, requestingUserId) => {
  if (id === requestingUserId.toString()) {
    throw ApiError.badRequest("You cannot deactivate your own account");
  }
  const user = await User.findByIdAndUpdate(
    id,
    { isActive: false },
    { new: true }
  );
  if (!user) throw ApiError.notFound("User not found");
  return user;
};

/**
 * Change user password
 */
const changePassword = async (id, currentPassword, newPassword) => {
  const user = await User.findById(id).select("+password");
  if (!user) throw ApiError.notFound("User not found");

  const isMatch = await user.comparePassword(currentPassword);
  if (!isMatch) throw ApiError.badRequest("Current password is incorrect");

  user.password = newPassword;
  await user.save();
  return { message: "Password changed successfully" };
};

module.exports = { getAllUsers, getUserById, updateUser, deleteUser, changePassword };

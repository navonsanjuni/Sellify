const Category = require("./category.model");
const ApiError = require("../../utils/ApiError");

const getAllCategories = async (query = {}) => {
  const { page = 1, limit = 20, isActive, search } = query;
  const skip = (page - 1) * limit;
  const filter = {};
  if (isActive !== undefined) filter.isActive = isActive === "true";
  if (search) filter.name = { $regex: search, $options: "i" };

  const [categories, total] = await Promise.all([
    Category.find(filter).skip(skip).limit(Number(limit)).sort({ name: 1 }),
    Category.countDocuments(filter),
  ]);

  return { categories, pagination: { total, page: Number(page), limit: Number(limit), totalPages: Math.ceil(total / limit) } };
};

const getCategoryById = async (id) => {
  const category = await Category.findById(id);
  if (!category) throw ApiError.notFound("Category not found");
  return category;
};

const createCategory = async (data) => {
  const category = await Category.create(data);
  return category;
};

const updateCategory = async (id, data) => {
  const category = await Category.findByIdAndUpdate(id, data, { new: true, runValidators: true });
  if (!category) throw ApiError.notFound("Category not found");
  return category;
};

const deleteCategory = async (id) => {
  const category = await Category.findByIdAndUpdate(id, { isActive: false }, { new: true });
  if (!category) throw ApiError.notFound("Category not found");
  return category;
};

module.exports = { getAllCategories, getCategoryById, createCategory, updateCategory, deleteCategory };

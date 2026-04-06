const categoryService = require("./category.service");
const asyncHandler = require("../../utils/asyncHandler");
const { sendResponse } = require("../../utils/ApiResponse");

const getAllCategories = asyncHandler(async (req, res) => {
  const result = await categoryService.getAllCategories(req.query);
  sendResponse(res, 200, result, "Categories retrieved successfully");
});

const getCategoryById = asyncHandler(async (req, res) => {
  const category = await categoryService.getCategoryById(req.params.id);
  sendResponse(res, 200, { category }, "Category retrieved successfully");
});

const createCategory = asyncHandler(async (req, res) => {
  if (req.file) req.body.image = req.file.path.replace(/\\/g, "/");
  const category = await categoryService.createCategory(req.body);
  sendResponse(res, 201, { category }, "Category created successfully");
});

const updateCategory = asyncHandler(async (req, res) => {
  if (req.file) req.body.image = req.file.path.replace(/\\/g, "/");
  const category = await categoryService.updateCategory(req.params.id, req.body);
  sendResponse(res, 200, { category }, "Category updated successfully");
});

const deleteCategory = asyncHandler(async (req, res) => {
  await categoryService.deleteCategory(req.params.id);
  sendResponse(res, 200, null, "Category deactivated successfully");
});

module.exports = { getAllCategories, getCategoryById, createCategory, updateCategory, deleteCategory };

const storefrontService = require("./storefront.service");
const asyncHandler = require("../../utils/asyncHandler");
const { sendResponse } = require("../../utils/ApiResponse");

const getProducts = asyncHandler(async (req, res) => {
  const result = await storefrontService.getProducts(req.query);
  sendResponse(res, 200, result, "Products retrieved");
});

const getFeaturedProducts = asyncHandler(async (req, res) => {
  const products = await storefrontService.getFeaturedProducts(req.query.limit);
  sendResponse(res, 200, { products }, "Featured products retrieved");
});

const getProductById = asyncHandler(async (req, res) => {
  const product = await storefrontService.getProductById(req.params.id);
  sendResponse(res, 200, { product }, "Product retrieved");
});

const getCategories = asyncHandler(async (req, res) => {
  const categories = await storefrontService.getCategories();
  sendResponse(res, 200, { categories }, "Categories retrieved");
});

module.exports = { getProducts, getFeaturedProducts, getProductById, getCategories };

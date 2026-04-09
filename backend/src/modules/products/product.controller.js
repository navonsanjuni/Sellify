const productService = require("./product.service");
const asyncHandler = require("../../utils/asyncHandler");
const { sendResponse } = require("../../utils/ApiResponse");

// ─── Admin/Staff ─────────────────────────────────────────────────────────────

const getAllProducts = asyncHandler(async (req, res) => {
  const result = await productService.getAllProducts(req.query);
  sendResponse(res, 200, result, "Products retrieved successfully");
});

const getProductById = asyncHandler(async (req, res) => {
  const product = await productService.getProductById(req.params.id);
  sendResponse(res, 200, { product }, "Product retrieved successfully");
});

const createProduct = asyncHandler(async (req, res) => {
  if (req.files && req.files.length > 0) {
    req.body.images = req.files.map((f) => f.path.replace(/\\/g, "/"));
  }
  const product = await productService.createProduct(req.body);
  sendResponse(res, 201, { product }, "Product created successfully");
});

const updateProduct = asyncHandler(async (req, res) => {
  if (req.files && req.files.length > 0) {
    req.body.images = req.files.map((f) => f.path.replace(/\\/g, "/"));
  }
  const product = await productService.updateProduct(req.params.id, req.body);
  sendResponse(res, 200, { product }, "Product updated successfully");
});

const deleteProduct = asyncHandler(async (req, res) => {
  await productService.deleteProduct(req.params.id);
  sendResponse(res, 200, null, "Product deactivated successfully");
});

const adjustStock = asyncHandler(async (req, res) => {
  const { quantity } = req.body;
  const product = await productService.adjustStock(req.params.id, Number(quantity));
  sendResponse(res, 200, { product }, "Stock adjusted successfully");
});

// ─── Public Storefront ───────────────────────────────────────────────────────

const getPublicProducts = asyncHandler(async (req, res) => {
  const result = await productService.getPublicProducts(req.query);
  sendResponse(res, 200, result, "Products retrieved");
});

const getFeaturedProducts = asyncHandler(async (req, res) => {
  const products = await productService.getFeaturedProducts(req.query.limit);
  sendResponse(res, 200, { products }, "Featured products retrieved");
});

const getPublicProductById = asyncHandler(async (req, res) => {
  const product = await productService.getPublicProductById(req.params.id);
  sendResponse(res, 200, { product }, "Product retrieved");
});

module.exports = {
  getAllProducts, getProductById, createProduct, updateProduct, deleteProduct, adjustStock,
  getPublicProducts, getFeaturedProducts, getPublicProductById,
};

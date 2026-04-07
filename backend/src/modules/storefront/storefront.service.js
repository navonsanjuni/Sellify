const Product = require("../products/product.model");
const Category = require("../categories/category.model");
const ApiError = require("../../utils/ApiError");

/**
 * Browse products (public — only active products)
 */
const getProducts = async (query = {}) => {
  const { page = 1, limit = 20, category, search, minPrice, maxPrice, sort } = query;
  const skip = (page - 1) * limit;

  const filter = { isActive: true };
  if (category) filter.category = category;
  if (search) filter.$text = { $search: search };
  if (minPrice || maxPrice) {
    filter.price = {};
    if (minPrice) filter.price.$gte = Number(minPrice);
    if (maxPrice) filter.price.$lte = Number(maxPrice);
  }

  // Sort options: newest, price-low, price-high, popular
  let sortOption = { createdAt: -1 };
  if (sort === "price-low") sortOption = { price: 1 };
  else if (sort === "price-high") sortOption = { price: -1 };
  else if (sort === "newest") sortOption = { createdAt: -1 };

  const [products, total] = await Promise.all([
    Product.find(filter)
      .populate("category", "name")
      .select("name description price images category stock createdAt")
      .skip(skip)
      .limit(Number(limit))
      .sort(sortOption),
    Product.countDocuments(filter),
  ]);

  return {
    products,
    pagination: {
      total,
      page: Number(page),
      limit: Number(limit),
      totalPages: Math.ceil(total / limit),
    },
  };
};

/**
 * Get featured/popular products (top selling or newest)
 */
const getFeaturedProducts = async (limitCount = 8) => {
  const products = await Product.find({ isActive: true })
    .populate("category", "name")
    .select("name description price images category stock")
    .sort({ createdAt: -1 })
    .limit(Number(limitCount));

  return products;
};

/**
 * Get single product detail (public)
 */
const getProductById = async (id) => {
  const product = await Product.findOne({ _id: id, isActive: true })
    .populate("category", "name");

  if (!product) throw ApiError.notFound("Product not found");
  return product;
};

/**
 * Get all active categories (public)
 */
const getCategories = async () => {
  const categories = await Category.find({ isActive: true })
    .select("name description image")
    .sort({ name: 1 });

  return categories;
};

module.exports = { getProducts, getFeaturedProducts, getProductById, getCategories };

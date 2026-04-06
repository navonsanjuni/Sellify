const Product = require("./product.model");
const ApiError = require("../../utils/ApiError");

const getAllProducts = async (query = {}) => {
  const { page = 1, limit = 20, category, isActive, search, lowStock } = query;
  const skip = (page - 1) * limit;

  const filter = {};
  if (category) filter.category = category;
  if (isActive !== undefined) filter.isActive = isActive === "true";
  if (search) filter.$text = { $search: search };
  if (lowStock === "true") filter.$expr = { $lte: ["$stock", "$lowStockThreshold"] };

  const [products, total] = await Promise.all([
    Product.find(filter)
      .populate("category", "name")
      .skip(skip)
      .limit(Number(limit))
      .sort({ createdAt: -1 }),
    Product.countDocuments(filter),
  ]);

  return {
    products,
    pagination: { total, page: Number(page), limit: Number(limit), totalPages: Math.ceil(total / limit) },
  };
};

const getProductById = async (id) => {
  const product = await Product.findById(id).populate("category", "name");
  if (!product) throw ApiError.notFound("Product not found");
  return product;
};

const createProduct = async (data) => {
  const product = await Product.create(data);
  return Product.findById(product._id).populate("category", "name");
};

const updateProduct = async (id, data) => {
  const product = await Product.findByIdAndUpdate(id, data, {
    new: true,
    runValidators: true,
  }).populate("category", "name");
  if (!product) throw ApiError.notFound("Product not found");
  return product;
};

const deleteProduct = async (id) => {
  const product = await Product.findByIdAndUpdate(
    id,
    { isActive: false },
    { new: true }
  );
  if (!product) throw ApiError.notFound("Product not found");
  return product;
};

/**
 * Adjust stock (positive = add, negative = deduct)
 */
const adjustStock = async (id, quantity) => {
  const product = await Product.findById(id);
  if (!product) throw ApiError.notFound("Product not found");

  if (product.stock + quantity < 0) {
    throw ApiError.badRequest(`Insufficient stock for "${product.name}". Available: ${product.stock}`);
  }

  product.stock += quantity;
  await product.save();
  return product;
};

module.exports = { getAllProducts, getProductById, createProduct, updateProduct, deleteProduct, adjustStock };

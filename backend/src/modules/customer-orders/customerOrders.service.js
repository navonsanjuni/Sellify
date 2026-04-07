const Order = require("../orders/order.model");
const ApiError = require("../../utils/ApiError");

/**
 * Get all orders for a specific customer (paginated)
 */
const getMyOrders = async (customerId, query = {}) => {
  const { page = 1, limit = 10 } = query;
  const skip = (page - 1) * limit;

  const filter = { customer: customerId };

  const [orders, total] = await Promise.all([
    Order.find(filter)
      .select("orderNumber items subtotal discount tax total paymentStatus orderStatus orderType createdAt")
      .skip(skip)
      .limit(Number(limit))
      .sort({ createdAt: -1 }),
    Order.countDocuments(filter),
  ]);

  return {
    orders,
    pagination: {
      total,
      page: Number(page),
      limit: Number(limit),
      totalPages: Math.ceil(total / limit),
    },
  };
};

/**
 * Get single order detail (only if it belongs to the customer)
 */
const getMyOrderById = async (orderId, customerId) => {
  const order = await Order.findOne({ _id: orderId, customer: customerId })
    .populate("items.product", "name sku images");

  if (!order) throw ApiError.notFound("Order not found");
  return order;
};

module.exports = { getMyOrders, getMyOrderById };

const mongoose = require("mongoose");
const Order = require("./order.model");
const Product = require("../products/product.model");
const Customer = require("../customers/customer.model");
const ApiError = require("../../utils/ApiError");

/**
 * Create a new order (POS transaction)
 * - Validates stock for all items
 * - Deducts stock atomically
 * - Updates customer stats
 */
const createOrder = async (data, createdBy) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { items, customerId, discount = 0, tax = 0, paymentMethod, amountPaid = 0 } = data;

    // 1. Validate and enrich items (fetch product, check stock)
    const enrichedItems = [];
    let subtotal = 0;

    for (const item of items) {
      const product = await Product.findById(item.productId).session(session);

      if (!product) throw ApiError.notFound(`Product not found: ${item.productId}`);
      if (!product.isActive) throw ApiError.badRequest(`Product "${product.name}" is no longer available`);
      if (product.stock < item.quantity) {
        throw ApiError.badRequest(
          `Insufficient stock for "${product.name}". Available: ${product.stock}, Requested: ${item.quantity}`
        );
      }

      const itemSubtotal = product.price * item.quantity;
      subtotal += itemSubtotal;

      enrichedItems.push({
        product: product._id,
        name: product.name,
        sku: product.sku || "",
        quantity: item.quantity,
        price: product.price,
        subtotal: itemSubtotal,
      });

      // Deduct stock
      await Product.findByIdAndUpdate(
        product._id,
        { $inc: { stock: -item.quantity } },
        { session }
      );
    }

    // 2. Calculate totals
    const total = Math.max(0, subtotal - discount + tax);
    const change = Math.max(0, amountPaid - total);
    const paymentStatus =
      amountPaid >= total ? "paid" : amountPaid > 0 ? "partial" : "unpaid";

    // 3. Create order
    const [order] = await Order.create(
      [
        {
          customer: customerId || null,
          items: enrichedItems,
          subtotal,
          discount,
          tax,
          total,
          paymentStatus,
          paymentMethod: paymentMethod || "none",
          amountPaid,
          change,
          notes: data.notes || "",
          createdBy,
        },
      ],
      { session }
    );

    // 4. Update customer stats (if customer provided)
    if (customerId) {
      await Customer.findByIdAndUpdate(
        customerId,
        { $inc: { totalOrders: 1, totalSpent: total } },
        { session }
      );
    }

    await session.commitTransaction();

    return Order.findById(order._id)
      .populate("customer", "name email phone")
      .populate("createdBy", "name email");
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
};

/**
 * Get all orders with filters + pagination
 */
const getAllOrders = async (query = {}) => {
  const { page = 1, limit = 20, paymentStatus, paymentMethod, customerId, startDate, endDate, search } = query;
  const skip = (page - 1) * limit;

  const filter = {};
  if (paymentStatus) filter.paymentStatus = paymentStatus;
  if (paymentMethod) filter.paymentMethod = paymentMethod;
  if (customerId) filter.customer = customerId;
  if (search) filter.orderNumber = { $regex: search, $options: "i" };

  if (startDate || endDate) {
    filter.createdAt = {};
    if (startDate) filter.createdAt.$gte = new Date(startDate);
    if (endDate) filter.createdAt.$lte = new Date(new Date(endDate).setHours(23, 59, 59, 999));
  }

  const [orders, total] = await Promise.all([
    Order.find(filter)
      .populate("customer", "name phone")
      .populate("createdBy", "name")
      .skip(skip)
      .limit(Number(limit))
      .sort({ createdAt: -1 }),
    Order.countDocuments(filter),
  ]);

  return { orders, pagination: { total, page: Number(page), limit: Number(limit), totalPages: Math.ceil(total / limit) } };
};

/**
 * Get a single order by ID
 */
const getOrderById = async (id) => {
  const order = await Order.findById(id)
    .populate("customer", "name email phone address")
    .populate("createdBy", "name email")
    .populate("items.product", "name sku images");

  if (!order) throw ApiError.notFound("Order not found");
  return order;
};

/**
 * Update payment status manually (e.g. mark unpaid as paid)
 */
const updatePaymentStatus = async (id, { paymentStatus, paymentMethod, amountPaid }) => {
  const order = await Order.findById(id);
  if (!order) throw ApiError.notFound("Order not found");

  if (paymentStatus) order.paymentStatus = paymentStatus;
  if (paymentMethod) order.paymentMethod = paymentMethod;
  if (amountPaid !== undefined) {
    order.amountPaid = amountPaid;
    order.change = Math.max(0, amountPaid - order.total);
  }

  await order.save();
  return order;
};

/**
 * Update order status (admin/staff — e.g. confirmed → processing → shipped → delivered)
 */
const updateOrderStatus = async (id, { orderStatus }) => {
  const order = await Order.findById(id);
  if (!order) throw ApiError.notFound("Order not found");

  const validTransitions = {
    pending: ["confirmed", "cancelled"],
    confirmed: ["processing", "cancelled"],
    processing: ["shipped", "cancelled"],
    shipped: ["delivered"],
    delivered: [],
    cancelled: [],
  };

  const allowed = validTransitions[order.orderStatus];
  if (!allowed || !allowed.includes(orderStatus)) {
    throw ApiError.badRequest(
      `Cannot change status from "${order.orderStatus}" to "${orderStatus}"`
    );
  }

  order.orderStatus = orderStatus;
  await order.save();
  return order;
};

module.exports = { createOrder, getAllOrders, getOrderById, updatePaymentStatus, updateOrderStatus };

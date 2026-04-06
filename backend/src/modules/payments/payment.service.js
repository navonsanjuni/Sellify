const Payment = require("./payment.model");
const Order = require("../orders/order.model");
const ApiError = require("../../utils/ApiError");

/**
 * Record a payment for an order
 */
const createPayment = async (data, processedBy) => {
  const order = await Order.findById(data.orderId);
  if (!order) throw ApiError.notFound("Order not found");

  const payment = await Payment.create({
    order: data.orderId,
    amount: data.amount,
    method: data.method,
    transactionId: data.transactionId || null,
    notes: data.notes || "",
    processedBy,
  });

  // Update order payment info
  order.amountPaid = (order.amountPaid || 0) + data.amount;
  order.change = Math.max(0, order.amountPaid - order.total);
  order.paymentMethod = data.method;
  order.paymentStatus =
    order.amountPaid >= order.total ? "paid" : order.amountPaid > 0 ? "partial" : "unpaid";
  await order.save();

  return payment;
};

/**
 * Get payments for a specific order
 */
const getPaymentsByOrder = async (orderId) => {
  const payments = await Payment.find({ order: orderId })
    .populate("processedBy", "name")
    .sort({ createdAt: -1 });
  return payments;
};

/**
 * Get all payments with filters
 */
const getAllPayments = async (query = {}) => {
  const { page = 1, limit = 20, method, status, startDate, endDate } = query;
  const skip = (page - 1) * limit;

  const filter = {};
  if (method) filter.method = method;
  if (status) filter.status = status;
  if (startDate || endDate) {
    filter.createdAt = {};
    if (startDate) filter.createdAt.$gte = new Date(startDate);
    if (endDate) filter.createdAt.$lte = new Date(new Date(endDate).setHours(23, 59, 59, 999));
  }

  const [payments, total] = await Promise.all([
    Payment.find(filter)
      .populate("order", "orderNumber total")
      .populate("processedBy", "name")
      .skip(skip)
      .limit(Number(limit))
      .sort({ createdAt: -1 }),
    Payment.countDocuments(filter),
  ]);

  return { payments, pagination: { total, page: Number(page), limit: Number(limit), totalPages: Math.ceil(total / limit) } };
};

module.exports = { createPayment, getPaymentsByOrder, getAllPayments };

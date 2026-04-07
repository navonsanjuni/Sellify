const orderService = require("./order.service");
const asyncHandler = require("../../utils/asyncHandler");
const { sendResponse } = require("../../utils/ApiResponse");

const createOrder = asyncHandler(async (req, res) => {
  const order = await orderService.createOrder(req.body, req.user._id);
  sendResponse(res, 201, { order }, "Order created successfully");
});

const getAllOrders = asyncHandler(async (req, res) => {
  const result = await orderService.getAllOrders(req.query);
  sendResponse(res, 200, result, "Orders retrieved successfully");
});

const getOrderById = asyncHandler(async (req, res) => {
  const order = await orderService.getOrderById(req.params.id);
  sendResponse(res, 200, { order }, "Order retrieved successfully");
});

const updatePaymentStatus = asyncHandler(async (req, res) => {
  const order = await orderService.updatePaymentStatus(req.params.id, req.body);
  sendResponse(res, 200, { order }, "Payment status updated successfully");
});

const updateOrderStatus = asyncHandler(async (req, res) => {
  const order = await orderService.updateOrderStatus(req.params.id, req.body);
  sendResponse(res, 200, { order }, "Order status updated successfully");
});

module.exports = { createOrder, getAllOrders, getOrderById, updatePaymentStatus, updateOrderStatus };

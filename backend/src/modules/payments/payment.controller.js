const paymentService = require("./payment.service");
const asyncHandler = require("../../utils/asyncHandler");
const { sendResponse } = require("../../utils/ApiResponse");

const createPayment = asyncHandler(async (req, res) => {
  const payment = await paymentService.createPayment(req.body, req.user._id);
  sendResponse(res, 201, { payment }, "Payment recorded successfully");
});

const getPaymentsByOrder = asyncHandler(async (req, res) => {
  const payments = await paymentService.getPaymentsByOrder(req.params.orderId);
  sendResponse(res, 200, { payments }, "Payments retrieved successfully");
});

const getAllPayments = asyncHandler(async (req, res) => {
  const result = await paymentService.getAllPayments(req.query);
  sendResponse(res, 200, result, "Payments retrieved successfully");
});

module.exports = { createPayment, getPaymentsByOrder, getAllPayments };

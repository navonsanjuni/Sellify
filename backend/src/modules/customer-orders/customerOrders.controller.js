const customerOrdersService = require("./customerOrders.service");
const asyncHandler = require("../../utils/asyncHandler");
const { sendResponse } = require("../../utils/ApiResponse");

const getMyOrders = asyncHandler(async (req, res) => {
  const result = await customerOrdersService.getMyOrders(req.customer._id, req.query);
  sendResponse(res, 200, result, "Orders retrieved");
});

const getMyOrderById = asyncHandler(async (req, res) => {
  const order = await customerOrdersService.getMyOrderById(req.params.id, req.customer._id);
  sendResponse(res, 200, { order }, "Order retrieved");
});

module.exports = { getMyOrders, getMyOrderById };

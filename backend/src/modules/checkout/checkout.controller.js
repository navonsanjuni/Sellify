const checkoutService = require("./checkout.service");
const asyncHandler = require("../../utils/asyncHandler");
const { sendResponse } = require("../../utils/ApiResponse");

const createSession = asyncHandler(async (req, res) => {
  const result = await checkoutService.createCheckoutSession(req.body, req.customer._id);
  sendResponse(res, 200, result, "Checkout session created");
});

const webhook = asyncHandler(async (req, res) => {
  const signature = req.headers["stripe-signature"];
  const result = await checkoutService.handleWebhook(req.body, signature);
  sendResponse(res, 200, result, "Webhook processed");
});

const getSessionStatus = asyncHandler(async (req, res) => {
  const result = await checkoutService.getSessionStatus(req.params.sessionId, req.customer._id);
  sendResponse(res, 200, result, "Session status retrieved");
});

module.exports = { createSession, webhook, getSessionStatus };

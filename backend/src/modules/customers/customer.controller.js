const customerService = require("./customer.service");
const asyncHandler = require("../../utils/asyncHandler");
const { sendResponse } = require("../../utils/ApiResponse");

const getAllCustomers = asyncHandler(async (req, res) => {
  const result = await customerService.getAllCustomers(req.query);
  sendResponse(res, 200, result, "Customers retrieved successfully");
});

const getCustomerById = asyncHandler(async (req, res) => {
  const customer = await customerService.getCustomerById(req.params.id);
  sendResponse(res, 200, { customer }, "Customer retrieved successfully");
});

const createCustomer = asyncHandler(async (req, res) => {
  const customer = await customerService.createCustomer(req.body);
  sendResponse(res, 201, { customer }, "Customer created successfully");
});

const updateCustomer = asyncHandler(async (req, res) => {
  const customer = await customerService.updateCustomer(req.params.id, req.body);
  sendResponse(res, 200, { customer }, "Customer updated successfully");
});

const deleteCustomer = asyncHandler(async (req, res) => {
  await customerService.deleteCustomer(req.params.id);
  sendResponse(res, 200, null, "Customer deactivated successfully");
});

module.exports = { getAllCustomers, getCustomerById, createCustomer, updateCustomer, deleteCustomer };

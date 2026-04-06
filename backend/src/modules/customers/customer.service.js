const Customer = require("./customer.model");
const ApiError = require("../../utils/ApiError");

const getAllCustomers = async (query = {}) => {
  const { page = 1, limit = 20, search, isActive } = query;
  const skip = (page - 1) * limit;
  const filter = {};

  if (isActive !== undefined) filter.isActive = isActive === "true";
  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: "i" } },
      { email: { $regex: search, $options: "i" } },
      { phone: { $regex: search, $options: "i" } },
    ];
  }

  const [customers, total] = await Promise.all([
    Customer.find(filter).skip(skip).limit(Number(limit)).sort({ name: 1 }),
    Customer.countDocuments(filter),
  ]);

  return { customers, pagination: { total, page: Number(page), limit: Number(limit), totalPages: Math.ceil(total / limit) } };
};

const getCustomerById = async (id) => {
  const customer = await Customer.findById(id);
  if (!customer) throw ApiError.notFound("Customer not found");
  return customer;
};

const createCustomer = async (data) => {
  const customer = await Customer.create(data);
  return customer;
};

const updateCustomer = async (id, data) => {
  const customer = await Customer.findByIdAndUpdate(id, data, { new: true, runValidators: true });
  if (!customer) throw ApiError.notFound("Customer not found");
  return customer;
};

const deleteCustomer = async (id) => {
  const customer = await Customer.findByIdAndUpdate(id, { isActive: false }, { new: true });
  if (!customer) throw ApiError.notFound("Customer not found");
  return customer;
};

module.exports = { getAllCustomers, getCustomerById, createCustomer, updateCustomer, deleteCustomer };

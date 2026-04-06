const Order = require("../orders/order.model");
const Product = require("../products/product.model");
const Customer = require("../customers/customer.model");
const asyncHandler = require("../../utils/asyncHandler");
const { sendResponse } = require("../../utils/ApiResponse");

/**
 * GET /api/dashboard/stats
 * Returns: today's sales, total revenue, total orders, top products, low stock alerts
 */
const getDashboardStats = asyncHandler(async (req, res) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);

  // Run all aggregations in parallel
  const [
    todaySales,
    totalRevenue,
    totalOrders,
    totalCustomers,
    totalProducts,
    topProducts,
    lowStockProducts,
    recentOrders,
    salesByDay,
  ] = await Promise.all([
    // Today's sales total
    Order.aggregate([
      { $match: { createdAt: { $gte: today, $lt: tomorrow }, paymentStatus: "paid" } },
      { $group: { _id: null, total: { $sum: "$total" }, count: { $sum: 1 } } },
    ]),

    // All-time revenue
    Order.aggregate([
      { $match: { paymentStatus: "paid" } },
      { $group: { _id: null, total: { $sum: "$total" } } },
    ]),

    // Total order count
    Order.countDocuments(),

    // Total active customers
    Customer.countDocuments({ isActive: true }),

    // Total active products
    Product.countDocuments({ isActive: true }),

    // Top 5 selling products
    Order.aggregate([
      { $unwind: "$items" },
      { $group: { _id: "$items.product", name: { $first: "$items.name" }, totalSold: { $sum: "$items.quantity" }, totalRevenue: { $sum: "$items.subtotal" } } },
      { $sort: { totalSold: -1 } },
      { $limit: 5 },
    ]),

    // Low stock products
    Product.find({
      isActive: true,
      $expr: { $lte: ["$stock", "$lowStockThreshold"] },
    })
      .select("name stock lowStockThreshold sku")
      .limit(10)
      .sort({ stock: 1 }),

    // Recent 5 orders
    Order.find()
      .populate("customer", "name")
      .select("orderNumber total paymentStatus createdAt customer")
      .sort({ createdAt: -1 })
      .limit(5),

    // Last 7 days sales
    Order.aggregate([
      {
        $match: {
          createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
          paymentStatus: "paid",
        },
      },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          sales: { $sum: "$total" },
          orders: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]),
  ]);

  sendResponse(
    res,
    200,
    {
      todaySales: {
        total: todaySales[0]?.total || 0,
        orders: todaySales[0]?.count || 0,
      },
      totalRevenue: totalRevenue[0]?.total || 0,
      totalOrders,
      totalCustomers,
      totalProducts,
      topProducts,
      lowStockProducts,
      recentOrders,
      salesByDay,
    },
    "Dashboard stats retrieved"
  );
});

module.exports = { getDashboardStats };

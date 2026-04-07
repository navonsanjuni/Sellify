const express = require("express");
const router = express.Router();

const authRoutes = require("../modules/auth/auth.routes");
const userRoutes = require("../modules/users/user.routes");
const productRoutes = require("../modules/products/product.routes");
const categoryRoutes = require("../modules/categories/category.routes");
const customerRoutes = require("../modules/customers/customer.routes");
const orderRoutes = require("../modules/orders/order.routes");
const paymentRoutes = require("../modules/payments/payment.routes");
const dashboardRoutes = require("../modules/dashboard/dashboard.routes");
const customerAuthRoutes = require("../modules/customer-auth/customerAuth.routes");
const storefrontRoutes = require("../modules/storefront/storefront.routes");
const checkoutRoutes = require("../modules/checkout/checkout.routes");
const customerOrderRoutes = require("../modules/customer-orders/customerOrders.routes");

router.use("/auth", authRoutes);
router.use("/users", userRoutes);
router.use("/products", productRoutes);
router.use("/categories", categoryRoutes);
router.use("/customers", customerRoutes);
router.use("/orders", orderRoutes);
router.use("/payments", paymentRoutes);
router.use("/dashboard", dashboardRoutes);
router.use("/customer-auth", customerAuthRoutes);
router.use("/storefront", storefrontRoutes);
router.use("/checkout", checkoutRoutes);
router.use("/customer-orders", customerOrderRoutes);

module.exports = router;

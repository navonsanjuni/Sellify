const mongoose = require("mongoose");
const Stripe = require("stripe");
const env = require("../../config/env");
const Order = require("../orders/order.model");
const Product = require("../products/product.model");
const Payment = require("../payments/payment.model");
const Customer = require("../customers/customer.model");
const ApiError = require("../../utils/ApiError");
const logger = require("../../utils/logger");

// Lazy init — only created when checkout endpoints are actually called
let stripe;
const getStripe = () => {
  if (!stripe) {
    stripe = new Stripe(env.STRIPE_SECRET_KEY);
  }
  return stripe;
};

/**
 * Create a Stripe Checkout Session
 */
const createCheckoutSession = async (data, customerId) => {
  const { items, shippingAddress } = data;

  // Validate products and check stock
  const lineItems = [];
  const orderItems = [];
  let subtotal = 0;

  for (const item of items) {
    const product = await Product.findById(item.productId);
    if (!product) throw ApiError.notFound(`Product not found: ${item.productId}`);
    if (!product.isActive) throw ApiError.badRequest(`Product "${product.name}" is no longer available`);
    if (product.stock < item.quantity) {
      throw ApiError.badRequest(
        `Insufficient stock for "${product.name}". Available: ${product.stock}, Requested: ${item.quantity}`
      );
    }

    const itemSubtotal = product.price * item.quantity;
    subtotal += itemSubtotal;

    orderItems.push({
      product: product._id,
      name: product.name,
      sku: product.sku || "",
      quantity: item.quantity,
      price: product.price,
      subtotal: itemSubtotal,
    });

    lineItems.push({
      price_data: {
        currency: "usd",
        product_data: {
          name: product.name,
          description: product.description || undefined,
          images: product.images && product.images.length > 0
            ? [product.images[0]]
            : undefined,
        },
        unit_amount: Math.round(product.price * 100), // Stripe uses cents
      },
      quantity: item.quantity,
    });
  }

  // Create Stripe Checkout Session
  const session = await getStripe().checkout.sessions.create({
    payment_method_types: ["card"],
    mode: "payment",
    line_items: lineItems,
    customer_email: (await Customer.findById(customerId))?.email || undefined,
    metadata: {
      customerId: customerId.toString(),
      orderItems: JSON.stringify(orderItems),
      shippingAddress: JSON.stringify(shippingAddress),
      subtotal: subtotal.toString(),
    },
    success_url: `${env.CLIENT_URL}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${env.CLIENT_URL}/checkout/cancel`,
  });

  return { sessionId: session.id, url: session.url };
};

/**
 * Handle Stripe webhook event
 */
const handleWebhook = async (payload, signature) => {
  let event;

  try {
    event = getStripe().webhooks.constructEvent(payload, signature, env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    throw ApiError.badRequest(`Webhook signature verification failed: ${err.message}`);
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    await fulfillOrder(session);
  }

  return { received: true };
};

/**
 * Fulfill order after successful payment
 */
const fulfillOrder = async (session) => {
  const dbSession = await mongoose.startSession();
  dbSession.startTransaction();

  try {
    const { customerId, orderItems, shippingAddress, subtotal } = session.metadata;
    const items = JSON.parse(orderItems);
    const address = JSON.parse(shippingAddress);
    const total = session.amount_total / 100; // Convert from cents

    // Deduct stock for each item
    for (const item of items) {
      const result = await Product.findOneAndUpdate(
        { _id: item.product, stock: { $gte: item.quantity } },
        { $inc: { stock: -item.quantity } },
        { session: dbSession }
      );
      if (!result) {
        throw new Error(`Insufficient stock for product: ${item.name}`);
      }
    }

    // Create the order
    const [order] = await Order.create(
      [
        {
          customer: customerId,
          items,
          subtotal: Number(subtotal),
          discount: 0,
          tax: Math.max(0, total - Number(subtotal)),
          total,
          paymentStatus: "paid",
          paymentMethod: "online",
          amountPaid: total,
          change: 0,
          orderStatus: "confirmed",
          orderType: "online",
          shippingAddress: address,
          stripeSessionId: session.id,
          createdBy: null,
        },
      ],
      { session: dbSession }
    );

    // Create payment record
    await Payment.create(
      [
        {
          order: order._id,
          amount: total,
          method: "online",
          status: "completed",
          transactionId: session.payment_intent,
          notes: "Stripe checkout payment",
          processedBy: null,
        },
      ],
      { session: dbSession }
    );

    // Update customer stats
    await Customer.findByIdAndUpdate(
      customerId,
      { $inc: { totalOrders: 1, totalSpent: total } },
      { session: dbSession }
    );

    await dbSession.commitTransaction();
    logger.info(`Order fulfilled: ${order.orderNumber} (Stripe session: ${session.id})`);
  } catch (error) {
    await dbSession.abortTransaction();
    logger.error(`Order fulfillment failed: ${error.message}`);
    throw error;
  } finally {
    dbSession.endSession();
  }
};

/**
 * Get checkout session status
 */
const getSessionStatus = async (sessionId, customerId) => {
  const order = await Order.findOne({ stripeSessionId: sessionId, customer: customerId })
    .populate("customer", "name email")
    .select("orderNumber items subtotal total orderStatus paymentStatus shippingAddress createdAt");

  if (!order) {
    // Check if session exists in Stripe but order not yet created (webhook pending)
    return { status: "processing", message: "Payment is being processed" };
  }

  return { status: "completed", order };
};

module.exports = { createCheckoutSession, handleWebhook, getSessionStatus };

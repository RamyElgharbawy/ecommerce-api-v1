const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const asyncHandler = require("express-async-handler");
const ApiError = require("../utils/apiError");
const factory = require("./handlersFactory");

const Cart = require("../models/cartModel");
const Product = require("../models/productModel");
const Order = require("../models/orderModel");
const User = require("../models/userModel");

// @desc      Create Order Service
// @route     POST /api/v1/orders/cartId
// @access    Private/user
exports.createCashOrder = asyncHandler(async (req, res, next) => {
  // app setting
  const taxPrice = 0;
  const shippingPrice = 0;

  // 1- Get cart with cartId from params.
  const cart = await Cart.findById(req.params.cartId);

  if (!cart) {
    return next(
      new ApiError(`There is no cart for this id: ${req.params.cartId}`, 404)
    );
  }
  // 2- Get order Price depend on cart price [check if coupon applied].
  const cartPrice = cart.totalPriceAfterDiscount
    ? cart.totalPriceAfterDiscount
    : cart.totalCartPrice;

  const totalOrderPrice = cartPrice + taxPrice + shippingPrice;

  // 3- Create Order with default paymentMethodType [cash].
  const order = await Order.create({
    user: req.user._id,
    cartItems: cart.cartItems,
    shippingAddress: req.body.shippingAddress,
    totalOrderPrice,
  });

  // 4- Adjust Quantity and Sold properties of Product in db.
  if (order) {
    const bulkOptions = cart.cartItems.map((item) => ({
      updateOne: {
        filter: { _id: item.product },
        update: { $inc: { quantity: -item.quantity, sold: +item.quantity } },
      },
    }));

    await Product.bulkWrite(bulkOptions, {});

    // 5- Clear user cart.
    await Cart.findByIdAndDelete(req.params.cartId);
  }

  res.status(201).json({ status: "Success", data: order });
});

// create user filter object middleware
exports.userFilterObject = asyncHandler(async (req, res, next) => {
  if (req.user.role === "user") req.filterObject = { user: req.user._id };

  next();
});

// @desc      Get All Orders Service
// @route     GET /api/v1/orders
// @access    Private/user - admin - manager
exports.getAllOrders = factory.getAll(Order);

// @desc      Get Specific Order Service
// @route     GET /api/v1/orders/:id
// @access    Private/user - admin - manager
exports.getOrder = factory.getOne(Order);

// @desc      Update Order to paid Service
// @route     PUT /api/v1/orders/:id/paid
// @access    Private/admin - manager
exports.updateOrderToPaid = asyncHandler(async (req, res, next) => {
  const order = await Order.findById(req.params.id);

  if (!order) {
    return next(
      new ApiError(`there is no order for this id: ${req.params.id}`, 404)
    );
  }

  order.isPaid = true;
  order.paidAt = Date.now();

  const updateOrder = await order.save();

  res.status(200).json({ status: "Success", data: updateOrder });
});

// @desc      Update Order to paid Service
// @route     PUT /api/v1/orders/:id/delivered
// @access    Private/admin - manager
exports.updateOrderToDelivered = asyncHandler(async (req, res, next) => {
  const order = await Order.findById(req.params.id);

  if (!order) {
    return next(
      new ApiError(`there is no order for this id: ${req.params.id}`, 404)
    );
  }

  order.isDelivered = true;
  order.deliveredAt = Date.now();

  const updateOrder = await order.save();

  res.status(200).json({ status: "Success", data: updateOrder });
});

// @desc      Get Checkout Session From Stripe & Send it to Client side
// @route     GET /api/v1/orders/checkout-session/:cartId
// @access    Private/user
exports.checkoutSession = asyncHandler(async (req, res, next) => {
  // app setting
  const taxPrice = 0;
  const shippingPrice = 0;

  // 1- Get cart with cartId from params.
  const cart = await Cart.findById(req.params.cartId);

  if (!cart) {
    return next(
      new ApiError(`There is no cart for this id: ${req.params.cartId}`, 404)
    );
  }
  // 2- Get order Price depend on cart price [check if coupon applied].
  const cartPrice = cart.totalPriceAfterDiscount
    ? cart.totalPriceAfterDiscount
    : cart.totalCartPrice;

  const totalOrderPrice = cartPrice + taxPrice + shippingPrice;

  // 3- create session
  const session = await stripe.checkout.sessions.create({
    line_items: [
      {
        price_data: {
          currency: "egp",
          unit_amount: totalOrderPrice * 100,
          product_data: {
            name: req.user.name,
            description: `E-Shop ${req.user.name} cart`,
          },
        },
        quantity: 1,
      },
    ],

    mode: "payment",

    success_url: `${req.protocol}://${req.get("host")}/api/v1/orders`,
    cancel_url: `${req.protocol}://${req.get("host")}/api/v1/cart`,

    customer_email: req.user.email,
    client_reference_id: req.params.cartId,
    metadata: req.body.shippingAddress,
  });

  // 4- send session as a response
  res.status(200).json({ status: "Success", session });
});

// create card order func
const createCardOrder = async (session) => {
  const cartId = session.client_reference_id;
  const shippingAddress = session.metadata;
  const orderPrice = session.amount_total / 100;

  // get user cart
  const cart = await Cart.findById(cartId);

  // get user
  const user = await User.findOne({ email: session.customer_email });

  // 3- Create Order with default paymentMethodType [cash].
  const order = await Order.create({
    user: user._id,
    cartItems: cart.cartItems,
    shippingAddress,
    totalOrderPrice: orderPrice,
    isPaid: true,
    paidAt: Date.now(),
    paymentMethodType: "card",
  });

  // 4- Adjust Quantity and Sold properties of Product in db.
  if (order) {
    const bulkOptions = cart.cartItems.map((item) => ({
      updateOne: {
        filter: { _id: item.product },
        update: { $inc: { quantity: -item.quantity, sold: +item.quantity } },
      },
    }));

    await Product.bulkWrite(bulkOptions, {});

    // 5- Clear user cart.
    await Cart.findByIdAndDelete(cartId);
  }
};

// @desc      Implement Stripe webhook & Create order
// @route     POST /api/v1/checkout-webhook
// @access    Private/user
exports.checkoutWebhook = asyncHandler(async (req, res, next) => {
  // Get the signature sent by Stripe
  const signature = req.headers["stripe-signature"];

  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      signature,
      process.env.WEBHOOK_SIGNING_SECRET
    );

    console.log(event);
  } catch (err) {
    return res
      .status(400)
      .send(`⚠️  Webhook signature verification failed.`, err.message);
  }
  console.log(event);

  if (event.type === "checkout.session.completed") {
    console.log("Create order here........");

    // create order
    createCardOrder(event.data.object);
  }

  res.status(200).json({ received: true });
});

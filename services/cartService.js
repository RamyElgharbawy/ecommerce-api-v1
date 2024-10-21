const asyncHandler = require("express-async-handler");

const Product = require("../models/productModel");
const ApiError = require("../utils/apiError");
const Coupon = require("../models/couponModel");
const Cart = require("../models/cartModel");

// Total price calculation function
const totalPriceCalc = (cart) => {
  let totalPrice = 0;
  cart.cartItems.forEach((item) => {
    totalPrice += item.quantity * item.price;
  });

  cart.totalCartPrice = totalPrice;
  cart.totalPriceAfterDiscount = undefined;

  return totalPrice;
};

// @desc      Add Product to cart Service
// @route     POST /api/v1/cart
// @access    Private/User
exports.addProductToCart = asyncHandler(async (req, res, next) => {
  const { productId, color } = req.body;

  const product = await Product.findById(productId);

  // 1- get logged user cart
  let cart = await Cart.findOne({ user: req.user._id });

  // 2- create cart with product to logged user if no cart
  if (!cart) {
    cart = await Cart.create({
      user: req.user._id,
      cartItems: [{ product: productId, color, price: product.price }],
    });
  } else {
    // if there is cart => check if product exist or not >>
    // get product index from db if exist
    const productIndex = cart.cartItems.findIndex(
      // check if there is item in cartItems with same productId and color in the body
      (item) => item.product.toString() === productId && item.color === color
    );
    // 1- if product exist in cart => update product quantity
    if (productIndex > -1) {
      const cartItem = cart.cartItems[productIndex];
      cartItem.quantity += 1;
      // save new quantity in items Array
      cart.cartItems[productIndex] = cartItem;
    } else {
      // 2- product not exist => push product to cartItems Array
      cart.cartItems.push({ product: productId, color, price: product.price });
    }
  }

  // calculate total cart price
  totalPriceCalc(cart);

  await cart.save();

  res.status(200).json({
    status: "Success",
    msg: "Product Added to cart Successfully",
    numberOfCartItems: cart.cartItems.length,
    data: cart,
  });
});

// @desc      Get logged user cart Service
// @route     GET /api/v1/cart
// @access    Private/User
exports.getLoggedUserCart = asyncHandler(async (req, res, next) => {
  const cart = await Cart.findOne({ user: req.user._id });

  if (!cart) {
    return next(
      new ApiError(`There is no cart for this id: ${req.user._id}`, 404)
    );
  }

  res.status(200).json({
    status: "Success",
    numberOfCartItems: cart.cartItems.length,
    data: cart,
  });
});

// @desc      Remove Product From cart Service
// @route     DELETE /api/v1/cart/:cartItemId
// @access    Private/user
exports.removeCartItem = asyncHandler(async (req, res, next) => {
  const cart = await Cart.findOneAndUpdate(
    { user: req.user._id },
    {
      $pull: { cartItems: { _id: req.params.cartItemId } },
    },
    {
      new: true,
    }
  );

  // calculate total cart price
  totalPriceCalc(cart);

  await cart.save();

  res.status(200).json({
    status: "Success",
    msg: "Item Removed Successfully from cart",
    numberOfCartItems: cart.cartItems.length,
    data: cart,
  });
});

// @desc      Clear Logged User cart Service
// @route     DELETE /api/v1/cart
// @access    Private/user
exports.clearCart = asyncHandler(async (req, res, next) => {
  await Cart.findOneAndDelete({ user: req.user._id });
  res.status(204).send();
});

// @desc      Update Cart Item Quantity Service
// @route     PUT /api/v1/cart/:cartItemId
// @access    Private/user
exports.updateCartItemQuantity = asyncHandler(async (req, res, next) => {
  const { quantity } = req.body;

  const cart = await Cart.findOne({ user: req.user._id });

  if (!cart) {
    return next(
      new ApiError(`There is no cart for this id: ${req.user._id}`, 404)
    );
  }

  const itemIndex = cart.cartItems.findIndex(
    (item) => item._id.toString() === req.params.cartItemId
  );

  if (itemIndex > -1) {
    const cartItem = cart.cartItems[itemIndex];
    // cartItem.quantity = quantity;
    cartItem.quantity = quantity;

    // save updated cart item to cartItems Array
    cart.cartItems[itemIndex] = cartItem;
  } else {
    return next(new ApiError(`There is no cartItem for this id`, 404));
  }

  // calc total cart price && save to db
  totalPriceCalc(cart);
  await cart.save();

  res.status(200).json({
    status: "Success",
    msg: "Quantity Updated Successfully",
    numberOfCartItems: cart.cartItems.length,
    data: cart,
  });
});

// @desc      Apply Coupon Service
// @route     PUT /api/v1/cart/applyCoupon
// @access    Private/user
exports.applyCoupon = asyncHandler(async (req, res, next) => {
  // 1- get coupon from db based on name & expire date
  const coupon = await Coupon.findOne({
    name: req.body.coupon,
    expire: { $gt: Date.now() },
  });

  if (!coupon) {
    return next(new ApiError(`Invalid Coupon name or expired coupon`, 404));
  }

  // 2- get user cart to calculate total cart price after discount
  const cart = await Cart.findOne({ user: req.user._id });

  // 3- calculate total cart after discount
  const totalPrice = cart.totalCartPrice;

  const totalPriceAfterDiscount = (
    totalPrice -
    (totalPrice * coupon.discount) / 100
  ).toFixed(2);

  // save total price after discount in cart
  cart.totalPriceAfterDiscount = totalPriceAfterDiscount;
  await cart.save();

  res.status(200).json({
    status: "Success",
    msg: "Coupon Applied Successfully",
    numberOfCartItems: cart.cartItems.length,
    data: cart,
  });
});

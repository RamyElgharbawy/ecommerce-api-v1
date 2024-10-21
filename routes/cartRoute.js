const express = require("express");

const router = express.Router();

const {
  addProductToCart,
  getLoggedUserCart,
  removeCartItem,
  clearCart,
  updateCartItemQuantity,
  applyCoupon,
} = require("../services/cartService");

const authService = require("../services/authService");

const {
  addProductToCartValidator,
  removeCartItemValidator,
} = require("../utils/validator/cartValidator");

router.use(authService.protect, authService.allowedTo("user"));

router
  .route("/")
  .post(addProductToCartValidator, addProductToCart)
  .get(getLoggedUserCart)
  .delete(clearCart);

router.put("/applyCoupon", applyCoupon);

router
  .route("/:cartItemId")
  .put(updateCartItemQuantity)
  .delete(removeCartItemValidator, removeCartItem);

module.exports = router;

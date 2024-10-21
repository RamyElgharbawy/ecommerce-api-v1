const express = require("express");

const router = express.Router();

const authService = require("../services/authService");

const {
  addProductToWishlist,
  removeProductFromWishlist,
  getLoggedUserWishlist,
} = require("../services/wishlistService");

const {
  addToWishlistValidator,
  removeFromWishlistValidator,
} = require("../utils/validator/wishlistValidator");

router.use(authService.protect, authService.allowedTo("user"));

router
  .route("/")
  .post(addToWishlistValidator, addProductToWishlist)
  .get(getLoggedUserWishlist);

router.delete(
  "/:productId",
  removeFromWishlistValidator,
  removeProductFromWishlist
);

module.exports = router;

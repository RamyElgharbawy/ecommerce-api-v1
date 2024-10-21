const asyncHandler = require("express-async-handler");
const User = require("../models/userModel");

// @desc      Add Product To User wishlist Service
// @route     POST /api/v1/wishlist
// @access    Private/User
exports.addProductToWishlist = asyncHandler(async (req, res, next) => {
  // 1- get logged user & add productId to his wishlist
  const user = await User.findByIdAndUpdate(
    req.user._id,
    {
      $addToSet: { wishlist: req.body.productId },
    },
    { new: true }
  );

  res.status(201).json({
    status: "Success",
    message: "Product Added Successfully to your wishlist",
    data: user.wishlist,
  });
});

// @desc      Remove Product From User wishlist Service
// @route     DELETE /api/v1/wishlist/:id
// @access    Private/User
exports.removeProductFromWishlist = asyncHandler(async (req, res, next) => {
  const user = await User.findByIdAndUpdate(
    req.user._id,
    {
      $pull: { wishlist: req.params.productId },
    },
    { new: true }
  );

  res.status(200).json({
    status: "Success",
    message: "Product Removed Successfully From your wishlist",
    data: user.wishlist,
  });
});

// @desc      Get Logged User wishlist Service
// @route     GET /api/v1/wishlist/
// @access    Private/User
exports.getLoggedUserWishlist = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user._id).populate("wishlist");

  res.status(200).json({
    status: "Success",
    result: user.wishlist.length,
    data: user.wishlist,
  });
});

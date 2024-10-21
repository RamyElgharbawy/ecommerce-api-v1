const asyncHandler = require("express-async-handler");
const User = require("../models/userModel");

// @desc      Add Address To User Addresses book Service
// @route     POST /api/v1/address
// @access    Private/User
exports.addAddressToUserAddressesList = asyncHandler(async (req, res, next) => {
  const user = await User.findByIdAndUpdate(
    req.user._id,
    {
      $addToSet: { addresses: req.body },
    },
    { new: true }
  );

  res.status(201).json({
    status: "success",
    message: "Address added successfully to your addresses List",
    data: user.addresses,
  });
});

// @desc      Remove Address From User Addresses book Service
// @route     DELETE /api/v1/address/:addressId
// @access    Private/User
exports.removeAddressFromUserAddressesList = asyncHandler(
  async (req, res, next) => {
    const user = await User.findByIdAndUpdate(
      req.user._id,
      {
        $pull: { addresses: { _id: req.params.addressId } },
      },
      { new: true }
    );

    res.status(200).json({
      status: "success",
      message: "Address removed successfully From your addresses List",
      data: user.addresses,
    });
  }
);

// @desc      Get Logged User Addresses List Service
// @route     GET /api/v1/address
// @access    Private/User
exports.getLoggedUserAddressList = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user._id).populate("addresses");

  res.status(200).json({
    status: "success",
    result: user.addresses.length,
    data: user.addresses,
  });
});

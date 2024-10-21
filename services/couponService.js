const factory = require("./handlersFactory");

const Coupon = require("../models/couponModel");

// @desc      Create Coupon Service
// @route     POST /api/v1/coupon
// @access    Private/Admin-Manager
exports.createCoupon = factory.createOne(Coupon);

// @desc      Create Coupon Service
// @route     POST /api/v1/coupon
// @access    Private/Admin-Manager
exports.getCoupon = factory.getOne(Coupon);

// @desc      Create Coupon Service
// @route     POST /api/v1/coupon
// @access    Private/Admin-Manager
exports.getCoupons = factory.getAll(Coupon);

// @desc      Create Coupon Service
// @route     POST /api/v1/coupon
// @access    Private/Admin-Manager
exports.updateCoupon = factory.updateOne(Coupon);

// @desc      Create Coupon Service
// @route     POST /api/v1/coupon
// @access    Private/Admin-Manager
exports.deleteCoupon = factory.deleteOne(Coupon);

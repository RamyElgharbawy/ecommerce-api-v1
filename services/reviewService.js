const factory = require("./handlersFactory");

const Review = require("../models/reviewModel");

// create filter object middleware for GET all reviews on specific product [nested route]
exports.createFilterObject = (req, res, next) => {
  let filterObject = {};
  // check if productId in params >> this request comes from nested route
  if (req.params.productId) filterObject = { product: req.params.productId };
  req.filterObject = filterObject; //  inject filterObject to req
  next();
};

// set productId into Body when POST request from [nested route]
exports.setProdIdAndUserIdToBody = (req, res, next) => {
  // check if no productId in body >> this request comes from nested route
  if (!req.body.product) req.body.product = req.params.productId;
  // set userId to body
  if (!req.body.user) req.body.user = req.user._id;
  next();
};

// @desc      Create Review Service
// @route     POST /api/v1/reviews
// @access    Private/Protect/user
exports.createReview = factory.createOne(Review);

// @desc      Get Specific Review Service
// @route     GET /api/v1/reviews/:id
// @access    Private/protect/user
exports.getReview = factory.getOne(Review);

// @desc      Get All Reviews Service
// @route     GET /api/v1/reviews
// @access    Public
exports.getReviews = factory.getAll(Review);

// @desc      Update Review Service
// @route     PUT /api/v1/reviews/:id
// @access    Private/protect/user
exports.updateReview = factory.updateOne(Review);

// @desc      Delete Review Service
// @route     DELETE /api/v1/reviews/:id
// @access    Private/protect/admin-manager-user
exports.deleteReview = factory.deleteOne(Review);

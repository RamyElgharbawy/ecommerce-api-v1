const { check } = require("express-validator");
const validatorMiddleware = require("../../middlewares/validatorMiddleware");

const Review = require("../../models/reviewModel");

exports.createReviewValidator = [
  check("title").optional(),

  check("ratings")
    .notEmpty()
    .withMessage("Review Ratings Required")
    .isFloat({ min: 1, max: 5 })
    .withMessage("Ratings Value is between 1 : 5"),

  check("user").isMongoId().withMessage("Invalid User id"),

  check("product")
    .isMongoId()
    .withMessage("Invalid Product id")
    .custom(
      async (val, { req }) =>
        // check if logged user create a review before
        await Review.findOne({
          user: req.user._id,
          product: req.body.product,
        }).then((review) => {
          if (review) {
            return Promise.reject(
              new Error("You Are Already rated this product")
            );
          }
        })
    ),
  validatorMiddleware,
];

exports.getReviewValidator = [
  check("id").isMongoId().withMessage("Invalid Review Id"),
  validatorMiddleware,
];

exports.updateReviewValidator = [
  check("id")
    .isMongoId()
    .withMessage("Invalid Review Id")
    .custom((val, { req }) =>
      Review.findById(val).then((review) => {
        if (!review) {
          return Promise.reject(
            new Error(`There is no review with this id: ${val}`)
          );
        }
        // check review ownership before update
        if (review.user._id.toString() !== req.user._id.toString()) {
          return Promise.reject(
            new Error(`You are not allowed to perform this action`)
          );
        }
      })
    ),
  validatorMiddleware,
];

exports.deleteReviewValidator = [
  check("id")
    .isMongoId()
    .withMessage("Invalid Review Id")
    .custom((val, { req }) => {
      if (req.user.role === "user") {
        return Review.findById(val).then((review) => {
          if (!review) {
            return Promise.reject(
              new Error(`There is no review with this id: ${val}`)
            );
          }
          // check review ownership before update
          if (review.user._id.toString() !== req.user._id.toString()) {
            return Promise.reject(
              new Error(`You are not allowed to perform this action`)
            );
          }
        });
      }
      return true;
    }),
  validatorMiddleware,
];

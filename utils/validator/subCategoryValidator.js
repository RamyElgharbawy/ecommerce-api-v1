const { default: slugify } = require("slugify");
const { check } = require("express-validator");
const validatorMiddleware = require("../../middlewares/validatorMiddleware");

// @desc create Sub Category validator
exports.createSubCategoryValidator = [
  check("name")
    .notEmpty()
    .withMessage("Sub Category Name Required")
    .isLength({ min: 2 })
    .withMessage("Min length 2 digits")
    .isLength({ max: 32 })
    .withMessage("Max length 32 digits")
    .custom((val, { req }) => {
      req.body.slug = slugify(val);
      return true;
    }),
  check("category")
    .notEmpty()
    .withMessage("Parent category id required")
    .isMongoId()
    .withMessage("Invalid category id format"),
  validatorMiddleware,
];

// @desc Get specific Sub Category validator
exports.getSubCategoryValidator = [
  check("id")
    .notEmpty()
    .withMessage("Sub Category id Required")
    .isMongoId()
    .withMessage("Invalid Subcategory id format"),
  validatorMiddleware,
];

// @desc update Sub Category validator
exports.updateSubCategoryValidator = [
  check("id").isMongoId().withMessage("Invalid subcategory id format"),
  check("name")
    .notEmpty()
    .withMessage("Sub Category Name Required")
    .isLength({ min: 2 })
    .withMessage("Min length 2 digits")
    .isLength({ max: 32 })
    .withMessage("Max length 32 digits")
    .custom((val, { req }) => {
      req.body.slug = slugify(val);
      return true;
    }),
  validatorMiddleware,
];

// @desc delete Sub Category validator
exports.deleteSubCategoryValidator = [
  check("id")
    .notEmpty()
    .withMessage("Sub Category id Required")
    .isMongoId()
    .withMessage("Invalid Subcategory id format"),
  validatorMiddleware,
];

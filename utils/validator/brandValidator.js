const { default: slugify } = require("slugify");
const { check } = require("express-validator");
const validatorMiddleware = require("../../middlewares/validatorMiddleware");

exports.createBrandValidator = [
  check("name")
    .notEmpty()
    .withMessage(`Brand Name required`)
    .isLength({ min: 3 })
    .withMessage("Min length 3 digits")
    .isLength({ max: 32 })
    .withMessage("Man length 3 digits")
    .custom((val, { req }) => {
      req.body.slug = slugify(val);
      return true;
    }),
  validatorMiddleware,
];

exports.getBrandValidator = [
  check("id")
    .isMongoId()
    .withMessage("Invalid Brand id format ")
    .notEmpty()
    .withMessage("Brand id required"),
  validatorMiddleware,
];

exports.updateBrandValidator = [
  check("id")
    .isMongoId()
    .withMessage("Invalid Brand id format ")
    .notEmpty()
    .withMessage("Brand id required"),
  check("name")
    .optional()
    .notEmpty()
    .withMessage(`Brand Name required`)
    .isLength({ min: 3 })
    .withMessage("Min length 3 digits")
    .isLength({ max: 32 })
    .withMessage("Man length 3 digits")
    .custom((val, { req }) => {
      //slug brand name before validation
      req.body.slug = slugify(val);
      return true;
    }),
  validatorMiddleware,
];

exports.deleteBrandValidator = [
  check("id")
    .isMongoId()
    .withMessage("Invalid Brand id format ")
    .notEmpty()
    .withMessage("Brand id required"),
  validatorMiddleware,
];

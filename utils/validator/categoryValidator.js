const { default: slugify } = require("slugify");
const { check, body } = require("express-validator");
const validatorMiddleware = require("../../middlewares/validatorMiddleware");

// @desc    get specific category validator
exports.getCategoryValidator = [
  check("id").isMongoId().withMessage(`Invalid category id format`),
  validatorMiddleware,
];

// @desc  create category validator
exports.createCategoryValidator = [
  check("name")
    .notEmpty()
    .withMessage("Category Name Required")
    .isLength({ min: 3 })
    .withMessage("Category Name Min length 3 digits")
    .isLength({ max: 32 })
    .withMessage("Category Name Max length 32 digits")
    .custom((val, { req }) => {
      req.body.slug = slugify(val);
      return true;
    }),
  validatorMiddleware,
];

// @desc  update category validator
exports.updateCategoryValidator = [
  check("id").isMongoId().withMessage("Invalid category id format"),
  body("name")
    .optional()
    .custom((val, { req }) => {
      req.body.slug = slugify(val);
      return true;
    }),
  validatorMiddleware,
];

// @desc  delete category validator
exports.deleteCategoryValidator = [
  check("id").isMongoId().withMessage("Invalid category id format"),
  validatorMiddleware,
];

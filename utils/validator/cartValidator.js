const { check } = require("express-validator");
const validatorMiddleware = require("../../middlewares/validatorMiddleware");

exports.addProductToCartValidator = [
  check("productId")
    .notEmpty()
    .withMessage("Product Id Required")
    .isMongoId()
    .withMessage("Invalid Product Id"),
  validatorMiddleware,
];

exports.removeCartItemValidator = [
  check("id").isMongoId().withMessage("Invalid Cart Item Id"),
  validatorMiddleware,
];

exports.updateCartItemValidator = [
  check("id").isMongoId().withMessage("Invalid Cart Item Id"),
  check("quantity")
    .notEmpty()
    .withMessage("Quantity Required")
    .isNumeric()
    .withMessage("Quantity Must be a number"),
  validatorMiddleware,
];

const { check } = require("express-validator");
const validatorMiddleware = require("../../middlewares/validatorMiddleware");
const Product = require("../../models/productModel");

exports.addToWishlistValidator = [
  check("productId")
    .notEmpty()
    .withMessage("Product Id required")
    .isMongoId()
    .withMessage("Invalid Product Id")
    .custom(async (val) => {
      await Product.findById(val).then((product) => {
        if (!product) {
          return Promise.reject(
            new Error(`There is no product for this id: ${val}`)
          );
        }
      });

      return true;
    }),
  validatorMiddleware,
];

exports.removeFromWishlistValidator = [
  check("productId").isMongoId().withMessage("Invalid Product Id"),
  validatorMiddleware,
];

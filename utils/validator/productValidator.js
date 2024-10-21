const { default: slugify } = require("slugify");
const { check, body } = require("express-validator");
const validatorMiddleware = require("../../middlewares/validatorMiddleware");

const CategoryModel = require("../../models/categoryModel");
const Subcategory = require("../../models/subCategoryModel");

exports.createProductValidator = [
  check("title")
    .notEmpty()
    .withMessage("Product Title is required")
    .isLength({ min: 3 })
    .withMessage("Product Name Min Length 3 digits")
    .isLength({ max: 100 })
    .withMessage("Product Name Max Length 100 digits")
    .custom((val, { req }) => {
      req.body.slug = slugify(val);
      return true;
    }),
  check("description")
    .notEmpty()
    .withMessage("Product Description is required")
    .isLength({ max: 2000 })
    .withMessage("Product Description Max Length 2000 digits"),
  check("quantity")
    .notEmpty()
    .withMessage("Product quantity is required")
    .isNumeric()
    .withMessage("Quantity must be A number"),
  check("sold")
    .optional()
    .isNumeric()
    .withMessage("sold filed must be A number"),
  check("price")
    .notEmpty()
    .withMessage("Product price is required")
    .isNumeric()
    .withMessage("Price must be A number")
    .isLength({ max: 10 })
    .withMessage("Product Price Max Length 10 digits"),
  check("priceAfterDiscount")
    .optional()
    .isNumeric()
    .withMessage("Price After Discount must be A number")
    .toFloat()
    .custom((value, { req }) => {
      if (req.body.price <= value) {
        throw new Error(`priceAfterDiscount must be lower than price`);
      }
      return true;
    }),
  check("colors")
    .optional()
    .isArray()
    .withMessage("Colors should be array of string"),
  check("imageCover").notEmpty().withMessage("Product cover image is required"),
  check("images")
    .optional()
    .isArray()
    .withMessage("Images should be array of string"),
  check("category")
    .notEmpty()
    .withMessage("Product Title is required")
    .isMongoId()
    .withMessage("Invalid Category id")
    .custom((categoryId) =>
      CategoryModel.findById(categoryId).then((category) => {
        if (!category) {
          return Promise.reject(
            new Error(`No Category for this id: ${categoryId}`)
          );
        }
      })
    ),
  check("subcategories")
    .optional()
    .isMongoId()
    .withMessage("Invalid Sub Category id")
    .custom((subCategoriesId) =>
      Subcategory.find({ _id: { $exists: true, $in: subCategoriesId } }).then(
        (result) => {
          if (result.length < 1 || result.length !== subCategoriesId.length) {
            return Promise.reject(new Error(`Invalid Subcategories Id's`));
          }
        }
      )
    )
    .custom((val, { req }) =>
      Subcategory.find({ category: req.body.category }).then(
        (subCategories) => {
          const subCategoryIdsInDB = [];
          subCategories.forEach((subCategory) =>
            subCategoryIdsInDB.push(subCategory._id.toString())
          );
          if (!val.every((v) => subCategoryIdsInDB.includes(v))) {
            return Promise.reject(
              new Error("Subcategories not belong to category")
            );
          }
        }
      )
    ),
  check("brand").optional().isMongoId().withMessage("Invalid Brand id"),
  check("ratingsAverage")
    .optional()
    .isNumeric()
    .withMessage("Rating Must be A Number")
    .isLength({ min: 1 })
    .withMessage("Product Rating must be above or equal 1.0")
    .isLength({ max: 5 })
    .withMessage("Product Rating must be below or equal 5.0"),
  check("ratingsQuantity")
    .optional()
    .isNumeric()
    .withMessage("Rating Quantity Must be A Number"),
  validatorMiddleware,
];

exports.getProductValidator = [
  check("id").isMongoId().withMessage("Invalid Product id"),
  validatorMiddleware,
];

exports.updateProductValidator = [
  check("id").isMongoId().withMessage("Invalid Product id"),
  body("title")
    .optional()
    .custom((val, { req }) => {
      req.body.slug = slugify(val);
      return true;
    }),
  validatorMiddleware,
];

exports.deleteProductValidator = [
  check("id").isMongoId().withMessage("Invalid Product id"),
  validatorMiddleware,
];

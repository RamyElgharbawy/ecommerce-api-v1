const { check } = require("express-validator");
const { default: slugify } = require("slugify");
const bcrypt = require("bcryptjs");

const validatorMiddleware = require("../../middlewares/validatorMiddleware");
const User = require("../../models/userModel");

exports.createUserValidator = [
  check("name")
    .notEmpty()
    .withMessage("Name Required")
    .isLength({ min: 3 })
    .withMessage("To Short Name")
    .custom((val, { req }) => {
      req.body.slug = slugify(val);
      return true;
    }),

  check("email")
    .notEmpty()
    .withMessage("Email Required")
    .isEmail()
    .withMessage("Invalid email address")
    .custom(async (val) => {
      await User.findOne({ email: val }).then((user) => {
        if (user) {
          return Promise.reject(
            new Error("This Email already registered please sign in")
          );
        }
      });
      return true;
    }),

  check("password")
    .notEmpty()
    .withMessage("Password Required")
    .isLength({ min: 6 })
    .withMessage("Password minimum length 6 digits")
    .custom((pass, { req }) => {
      if (pass !== req.body.passwordConfirm) {
        throw new Error("Confirm Password incorrect");
      }
      return true;
    }),

  check("passwordConfirm").notEmpty().withMessage("confirm password required"),

  check("profileImage").optional(),
  check("role").optional(),

  check("phone")
    .optional()
    .isMobilePhone(["ar-EG", "ar-SA"])
    .withMessage("Only accepted egypt & SA phone numbers"),

  validatorMiddleware,
];

exports.getUserValidator = [
  check("id")
    .notEmpty()
    .withMessage("User id required")
    .isMongoId()
    .withMessage("Invalid Usr Id"),
  validatorMiddleware,
];

exports.updateUserValidator = [
  check("id")
    .notEmpty()
    .withMessage("User id required")
    .isMongoId()
    .withMessage("Invalid User Id"),

  check("name")
    .optional()
    .notEmpty()
    .withMessage("Name Required")
    .isLength({ min: 3 })
    .withMessage("To Short Name")
    .custom((val, { req }) => {
      req.body.slug = slugify(val);
      return true;
    }),

  check("email")
    .optional()
    .notEmpty()
    .withMessage("Email Required")
    .isEmail()
    .withMessage("Invalid email address")
    .custom(async (val) => {
      await User.findOne({ email: val }).then((user) => {
        if (user) {
          return Promise.reject(
            new Error("This Email already registered please sign in")
          );
        }
      });
    }),

  check("password")
    .optional()
    .notEmpty()
    .withMessage("Password Required")
    .isLength({ min: 6 })
    .withMessage("Password minimum length 6 digits"),

  check("profileImage").optional(),
  check("role").optional(),

  check("phone")
    .optional()
    .isMobilePhone(["ar-EG", "ar-SA"])
    .withMessage("Only accepted egypt & SA phone numbers"),
  validatorMiddleware,
];

exports.changePasswordValidator = [
  check("id").isMongoId().withMessage("Invalid User id"),

  check("currentPassword")
    .notEmpty()
    .withMessage("You Must Enter Current Password"),

  check("passwordConfirm")
    .notEmpty()
    .withMessage("You Must Enter password confirm"),

  check("password")
    .notEmpty()
    .withMessage("You Must Enter new Password")
    .custom(async (val, { req }) => {
      // 1- verify current password
      const user = await User.findById(req.params.id);

      if (!user) {
        throw new Error("There is no user for this id");
      }

      const isCorrectPassword = await bcrypt.compare(
        req.body.currentPassword,
        user.password
      );

      if (!isCorrectPassword) {
        throw new Error("Current Password is not correct");
      }

      // 2- verify new password confirm
      if (val !== req.body.passwordConfirm) {
        throw new Error("Confirm Password is incorrect");
      }

      return true;
    }),
  validatorMiddleware,
];

exports.deleteUserValidator = [
  check("id")
    .notEmpty()
    .withMessage("User id required")
    .isMongoId()
    .withMessage("Invalid Usr Id"),
  validatorMiddleware,
];

// Logged User

exports.changeLoggedUserPassValidator = [
  check("password")
    .notEmpty()
    .withMessage("Password Required")
    .isLength({ min: 6 })
    .withMessage("Password minimum length 6 digits")
    .custom((pass, { req }) => {
      if (pass !== req.body.passwordConfirm) {
        throw new Error("Confirm Password incorrect");
      }
      return true;
    }),

  check("passwordConfirm").notEmpty().withMessage("confirm password required"),

  check("profileImage").optional(),
  check("role").optional(),

  check("phone")
    .optional()
    .isMobilePhone(["ar-EG", "ar-SA"])
    .withMessage("Only accepted egypt & SA phone numbers"),
];

exports.updateLoggedUserValidator = [
  check("name")
    .optional()
    .notEmpty()
    .withMessage("Name Required")
    .isLength({ min: 3 })
    .withMessage("To Short Name")
    .custom((val, { req }) => {
      req.body.slug = slugify(val);
      return true;
    }),

  check("email")
    .optional()
    .notEmpty()
    .withMessage("Email Required")
    .isEmail()
    .withMessage("Invalid email address")
    .custom(async (val) => {
      await User.findOne({ email: val }).then((user) => {
        if (user) {
          return Promise.reject(
            new Error("This Email already registered please sign in")
          );
        }
      });
    }),

  check("password")
    .optional()
    .notEmpty()
    .withMessage("Password Required")
    .isLength({ min: 6 })
    .withMessage("Password minimum length 6 digits"),

  check("profileImage").optional(),
  check("role").optional(),

  check("phone")
    .optional()
    .isMobilePhone(["ar-EG", "ar-SA"])
    .withMessage("Only accepted egypt & SA phone numbers"),
  validatorMiddleware,
];

exports.activateLoggedUserValidator = [
  check("email")
    .notEmpty()
    .withMessage("Email Required")
    .isEmail()
    .withMessage("Invalid email address"),
  validatorMiddleware,
];

const { check } = require("express-validator");
const validatorMiddleware = require("../../middlewares/validatorMiddleware");

exports.addAddressValidator = [
  check("alias").notEmpty().withMessage("Address Type Required"),

  check("details").notEmpty().withMessage("Address Details Required"),

  check("phone")
    .isNumeric()
    .notEmpty()
    .withMessage("Phone Number Required")
    .isMobilePhone("ar-EG")
    .withMessage("Only Accepts Egypt And Saudi Arabia Phone number"),

  check("postalCode")
    .optional()
    .isPostalCode("EE")
    .withMessage("Only Accepts Egypt Postal Code"),

  validatorMiddleware,
];

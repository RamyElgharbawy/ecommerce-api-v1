const { check } = require("express-validator");
const validatorMiddleware = require("../../middlewares/validatorMiddleware");
const Coupon = require("../../models/couponModel");

exports.createCouponValidator = [
  check("name")
    .notEmpty()
    .withMessage("Coupon name required")
    .custom(async (val, { req }) => {
      // check if coupon name exist
      await Coupon.findOne({ name: req.body.name }).then((coupon) => {
        if (coupon) {
          console.log(coupon);

          if (val === coupon.name) {
            return Promise.reject(new Error("Coupon name must be unique"));
          }
        } else {
          return true;
        }
      });
    }),

  check("discount")
    .notEmpty()
    .withMessage("Discount Value required")
    .isNumeric()
    .withMessage("Discount value must be a number"),

  check("expire")
    .notEmpty()
    .withMessage("Coupon expire time required")
    .custom((val) => {
      // get current time stamp
      const currentDate = Date.now();

      // get expire date stamp
      const [d, m, y] = val.split(/-|\//); // splits "26-02-2012" or "26/02/2012"
      const expireDateStamp = new Date(y, m - 1, d).getTime();
      // check if expire date after current date
      if (expireDateStamp < currentDate) {
        return Promise.reject(
          new Error("Expire date must be after current date")
        );
      }
      return true;
    }),

  validatorMiddleware,
];

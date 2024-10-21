const express = require("express");

const router = express.Router();

const authService = require("../services/authService");

const {
  createCoupon,
  getCoupon,
  getCoupons,
  updateCoupon,
  deleteCoupon,
} = require("../services/couponService");

const { createCouponValidator } = require("../utils/validator/couponValidator");

router.use(authService.protect, authService.allowedTo("admin", "manager"));

router.route("/").post(createCouponValidator, createCoupon).get(getCoupons);

router.route("/:id").get(getCoupon).put(updateCoupon).delete(deleteCoupon);

module.exports = router;

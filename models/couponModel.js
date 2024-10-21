const mongoose = require("mongoose");

const couponSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
      required: [true, "Coupon Name Required"],
      unique: true,
    },
    discount: {
      type: Number,
      required: [true, "Discount value Required"],
    },
    expire: {
      type: Date,
      required: [true, "Coupon expire time required"],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Coupon", couponSchema);

const mongoose = require("mongoose");
const Product = require("./productModel");

const reviewSchema = new mongoose.Schema(
  {
    title: {
      type: String,
    },
    ratings: {
      type: Number,
      required: [true, "Review Rating required"],
      min: [1, "Ratings Min Value 1.0"],
      max: [5, "Ratings Max Value 5.0"],
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
      required: [true, "Review Must belong to user"],
    },
    product: {
      type: mongoose.Schema.ObjectId,
      ref: "Product",
      required: [true, "Review Must belong to product"],
    },
  },
  { timestamps: true }
);

// populate user in review response
reviewSchema.pre(/^find/, function (next) {
  this.populate({ path: "user", select: "name" });
  next();
});

// Aggregate method [get reviews average and quantity on specific product]
reviewSchema.statics.calcRatingsAvgAndQuantity = async function (productId) {
  const result = await this.aggregate([
    // stage 1: matching reviews by productId
    { $match: { product: productId } },
    // stage 2: grouping matched reviews by productId & calc summation and quantity
    {
      $group: {
        _id: "product",
        avgRatings: { $avg: "$ratings" },
        ratingsQuantity: { $sum: 1 },
      },
    },
  ]);

  if (result.length > 0) {
    await Product.findByIdAndUpdate(productId, {
      ratingsAverage: result[0].avgRatings,
      ratingsQuantity: result[0].ratingsQuantity,
    });
  } else {
    await Product.findByIdAndUpdate(productId, {
      ratingsAverage: 0,
      ratingsQuantity: 0,
    });
  }
};

// calc ratings average and quantity after doc saved in db
reviewSchema.post("save", async function () {
  await this.constructor.calcRatingsAvgAndQuantity(this.product);
});

// calc ratings average and quantity after doc removed from db
reviewSchema.post("deleteOne", async function () {
  await this.constructor.calcRatingsAvgAndQuantity(this.product);
});

module.exports = mongoose.model("Review", reviewSchema);

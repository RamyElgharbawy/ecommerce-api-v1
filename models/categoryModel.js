const mongoose = require("mongoose");
// 1- create schema
const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      require: [true, "Category Name Required"],
      unique: [true, "Category must be unique"],
      minlength: [3, "Too short category name"],
      maxlength: [32, "Too long category name"],
    },
    slug: {
      type: String,
      lowercase: true,
    },
    image: String,
  },
  { timestamps: true }
);

// Mongoose Middleware for set image url into response object
const setImageURL = (doc) => {
  if (doc.image) {
    const imageUrl = `${process.env.BASE_URL}/categories/${doc.image}`;
    doc.image = imageUrl;
  }
};
// set image url in doc when update & findOne & findAll doc
categorySchema.post("init", (doc) => setImageURL(doc));

// set image url in doc when create doc
categorySchema.post("save", (doc) => setImageURL(doc));

// 2- create model
const CategoryModel = mongoose.model("Category", categorySchema);

module.exports = CategoryModel;

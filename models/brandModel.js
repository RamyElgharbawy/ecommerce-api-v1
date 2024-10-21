const mongoose = require("mongoose");

const brandSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      require: [true, "Brand name required"],
      unique: [true, "Brand must be unique"],
      minlength: [3, "Too short brand name"],
      maxlength: [32, "Too long brand name"],
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
    const imageUrl = `${process.env.BASE_URL}/brands/${doc.image}`;
    doc.image = imageUrl;
  }
};
// set image url in response when update & findOne & findAll methods
brandSchema.post("init", (doc) => setImageURL(doc));

// set image url in response when create doc method
brandSchema.post("save", (doc) => setImageURL(doc));

module.exports = mongoose.model("Brand", brandSchema);

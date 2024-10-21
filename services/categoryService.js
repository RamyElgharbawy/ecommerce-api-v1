const sharp = require("sharp");
const { v4: uuidv4 } = require("uuid");

const asyncHandler = require("express-async-handler");
const factory = require("./handlersFactory");
const { uploadSingleImage } = require("../middlewares/uploadImageMiddleware");
const Category = require("../models/categoryModel");

// upload category image middleware
exports.uploadCategoryImage = uploadSingleImage("image");

// Image Processing Middleware with sharp lib
exports.resizeImage = asyncHandler(async (req, res, next) => {
  const filename = `category-${uuidv4()}-${Date.now()}.jpeg`;

  if (req.file) {
    await sharp(req.file.buffer)
      .resize(600, 600)
      .toFormat("jpeg")
      .jpeg({ quality: 90 })
      .toFile(`uploads/categories/${filename}`);

    // inject file name into body to save it in database
    req.body.image = filename;
  }

  next();
});

// @desc   Create Category
// @route  POST /api/v1/categories
// @access Private/Admin - manager
exports.createCategory = factory.createOne(Category);

// @desc    Get Categories List
// @route   GET /api/v1/categories
// @access  Public
exports.getCategories = factory.getAll(Category);

// @desc    Get Specific Category By Id
// @route   GET /api/v1/categories/:id
// @access  Public
exports.getCategory = factory.getOne(Category);

// @desc    Update Category By id
// @route   PUT /api/v1/:id
// @access  Private/Admin - manager
exports.updateCategory = factory.updateOne(Category);

// @desc    Delete Specific Category by id
// @route   DELETE /api/v1/categories/:id
// @access  Private/Admin
exports.deleteCategory = factory.deleteOne(Category);

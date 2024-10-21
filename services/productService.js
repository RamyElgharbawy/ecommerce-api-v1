const { v4: uuidv4 } = require("uuid");
const asyncHandler = require("express-async-handler");
const Sharp = require("sharp");

const factory = require("./handlersFactory");
const { uploadMixImages } = require("../middlewares/uploadImageMiddleware");
const Product = require("../models/productModel");

exports.uploadProductImages = uploadMixImages([
  { name: "imageCover", maxCount: 1 },
  { name: "images", maxCount: 5 },
]);

exports.resizeProductImages = asyncHandler(async (req, res, next) => {
  // 1- Processing imageCover
  if (req.files.imageCover) {
    const imageCoverName = `product-${uuidv4()}-${Date.now()}-cover.jpeg`;

    await Sharp(req.files.imageCover[0].buffer)
      .resize(2000, 1333)
      .toFormat("jpeg")
      .jpeg({ quality: 95 })
      .toFile(`uploads/products/${imageCoverName}`);

    req.body.imageCover = imageCoverName;
  }

  // 2- Processing product images
  if (req.files.images) {
    req.body.images = [];

    await Promise.all(
      req.files.images.map(async (img, indx) => {
        const imageName = `product-${uuidv4()}-${Date.now()}-${indx}.jpeg`;

        await Sharp(img.buffer)
          .resize(2000, 1333)
          .toFormat("jpeg")
          .jpeg({ quality: 95 })
          .toFile(`uploads/products/${imageName}`);

        req.body.images.push(imageName);
      })
    );
  }

  next();
});

// @desc      Create Product Service
// @route     POST /api/v1/products
// @access    Private/Admin - manager
exports.createProduct = factory.createOne(Product);

// @desc      Get List of Products
// @route     GET /api/v1/products
// @access    Public
exports.getProducts = factory.getAll(Product, "Product");

// @desc      Get specific Product by id
// @route     GET /api/v1/products/:id
// @access    Public
exports.getProduct = factory.getOne(Product, "reviews");

// @desc      Update Product Service
// @route     PUT /api/v1/products/:id
// @access    Private/Admin - manager
exports.updateProduct = factory.updateOne(Product);

// @desc      Delete Product Service
// @route     DELETE /api/v1/products/:id
// @access    Private/Admin
exports.deleteProduct = factory.deleteOne(Product);

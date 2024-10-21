const sharp = require("sharp");
const { v4: uuidv4 } = require("uuid");
const expressAsyncHandler = require("express-async-handler");

const { uploadSingleImage } = require("../middlewares/uploadImageMiddleware");
const factory = require("./handlersFactory");
const Brand = require("../models/brandModel");

// upload brand image middleware
exports.uploadBrandImage = uploadSingleImage("image");

// Image Processing Middleware with sharp lib
exports.resizeImage = expressAsyncHandler(async (req, res, next) => {
  const filename = `brand-${uuidv4()}-${Date.now()}.jpeg`;

  if (req.file) {
    await sharp(req.file.buffer)
      .resize(600, 600)
      .toFormat("jpeg")
      .jpeg({ quality: 95 })
      .toFile(`uploads/brands/${filename}`);

    // inject file name into body to save it in database
    req.body.image = filename;
  }

  next();
});

// @desc      Create Brand
// @route     POST /api/v1/brands
// @access    Private/Admin - manager
exports.createBrand = factory.createOne(Brand);

// @desc      Get list of Brands
// @route     GET /api/v1/brands
// @access    Public
exports.getBrands = factory.getAll(Brand);

// @desc      Get specific Brand by id
// @route     GET /api/v1/brands/:id
// @access    Public
exports.getBrand = factory.getOne(Brand);

// @desc      Update Brand by id
// @route     PUT /api/v1/brands/:id
// @access    Private/Admin - manager
exports.updateBrand = factory.updateOne(Brand);

// @desc      Delete Brand by id
// @route     DELETE /api/v1/brands/:id
// @access    Private/Admin
exports.deleteBrand = factory.deleteOne(Brand);

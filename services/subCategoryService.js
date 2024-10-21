const SubCategory = require("../models/subCategoryModel");
const factory = require("./handlersFactory");

// Set categoryId to body Middleware for create subCat on Cat nested route
exports.setCategoryIdToBody = (req, res, next) => {
  if (!req.body.category) req.body.category = req.params.categoryId;
  next();
};

// Create filterObject Middleware for get all subCat on category nested route
exports.createFilterObject = (req, res, next) => {
  let filterObject = {};
  if (req.params.categoryId) filterObject = { category: req.params.categoryId };
  req.filterObject = filterObject; // inject filterObject to req
  next();
};

// @desc      create subCategory
// @route     POST /api/v1/subcategories
// @access    Private/Admin - manager
exports.createSubCategory = factory.createOne(SubCategory);

// @desc      Get subCategory list of Parent category
// @route     GET /api/v1/subcategories
// @route     GET /api/v1/categories/:categoryId/subcategory
// @access    Public
exports.getSubCategories = factory.getAll(SubCategory);

// @desc      Get specific subCategory by Id
// @route     GET /api/v1/subcategories/:id
// @access    Public
exports.getSubCategory = factory.getOne(SubCategory);

// @desc      Update subCategory
// @route     PUT /api/v1/subcategories/:id
// @access    Private/Admin - manager
exports.updateSubCategory = factory.updateOne(SubCategory);

// @desc      Delete subCategory
// @route     DELETE /api/v1/subcategories/:id
// @access    Private/Admin
exports.deleteSubCategory = factory.deleteOne(SubCategory);

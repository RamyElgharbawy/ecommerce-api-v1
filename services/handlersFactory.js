const asyncHandler = require("express-async-handler");
const ApiError = require("../utils/apiError");
const ApiFeature = require("../utils/apiFeature");

// Delete handler
exports.deleteOne = (Model) =>
  asyncHandler(async (req, res, next) => {
    const { id } = req.params;

    const document = await Model.findOneAndDelete({ _id: id });

    if (!document)
      return next(new ApiError(`No Document For This id: ${id}`, 404));

    if (Model.modelName === "Review") {
      await Model.calcRatingsAvgAndQuantity(document.product);
    }

    res.status(204).send();
  });

// update Handler
exports.updateOne = (Model) =>
  asyncHandler(async (req, res, next) => {
    const document = await Model.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!document) {
      return next(
        new ApiError(`No document For this id: ${req.params.id}`, 404)
      );
    }

    // Trigger "save" event in db model
    document.save();

    res.status(201).json({ data: document });
  });

// create handler
exports.createOne = (Model) =>
  asyncHandler(async (req, res, next) => {
    const newDoc = await Model.create(req.body);

    res.status(201).json({ data: newDoc });
  });

// get specific document handler
exports.getOne = (Model, populateOpt) =>
  asyncHandler(async (req, res, next) => {
    const { id } = req.params;

    // build query
    let query = Model.findById(id);

    if (populateOpt) {
      query = query.populate(populateOpt);
    }
    // execute query
    const document = await query;

    if (!document) {
      return next(new ApiError(`No document For this id: ${id}`, 404));
    }
    res.status(200).json({ data: document });
  });

// get all docs handler
exports.getAll = (Model, modelName = "") =>
  asyncHandler(async (req, res, next) => {
    let filter = {};
    if (req.filterObject) filter = req.filterObject;

    // get documents count from db
    const documentsCount = await Model.countDocuments();
    // build query
    const apiFeature = new ApiFeature(Model.find(filter), req.query)
      .filter()
      .sort()
      .search(modelName)
      .limitFields()
      .paginate(documentsCount);

    const { mongooseQuery, paginationResult } = apiFeature;
    // execute query
    const documents = await mongooseQuery;

    res
      .status(200)
      .json({ results: documents.length, paginationResult, data: documents });
  });

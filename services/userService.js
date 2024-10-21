const { v4: uuidv4 } = require("uuid");
const Sharp = require("sharp");
const asyncHandler = require("express-async-handler");
const bcrypt = require("bcryptjs");

const factory = require("./handlersFactory");
const { uploadSingleImage } = require("../middlewares/uploadImageMiddleware");
const ApiError = require("../utils/apiError");
const generateToken = require("../utils/createToken");

const User = require("../models/userModel");

// upload user profile image middleware
exports.uploadUserImage = uploadSingleImage("profileImage");

// processing image
exports.resizeImage = asyncHandler(async (req, res, next) => {
  const imageName = `user-${uuidv4()}-${Date.now()}-profileImage.jpeg`;

  if (req.file) {
    await Sharp(req.file.buffer)
      .resize(600, 600)
      .toFormat("jpeg")
      .jpeg({ quality: 95 })
      .toFile(`uploads/users/${imageName}`);

    req.body.profileImage = imageName;
  }

  next();
});

// @desc      Create User Service
// @route     POST /api/v1/users
// @access    Private/Admin
exports.createUser = factory.createOne(User);

// @desc      Get All Users Service
// @route     GET /api/v1/users
// @access    Private/Admin - manager
exports.getUsers = factory.getAll(User);

// @desc      Get Specific User Service
// @route     GET /api/v1/users/:id
// @access    Private/Admin
exports.getUser = factory.getOne(User);

// @desc      Update Specific User Service
// @route     PUT /api/v1/users/:id
// @access    Private/Admin
exports.updateUser = asyncHandler(async (req, res, next) => {
  const user = await User.findByIdAndUpdate(
    req.params.id,
    {
      name: req.body.name,
      slug: req.body.slug,
      email: req.body.email,
      phone: req.body.phone,
      profileImage: req.body.profileImage,
      role: req.body.role,
    },
    { new: true }
  );

  if (!user) {
    return next(new ApiError(`No User For This id:${req.params.id}`, 404));
  }

  res.status(201).json({ data: user });
});

// @desc      Change User Password Service
// @route     PUT /api/v1/user/changePassword/:id
// @access    Private/Admin
exports.changeUserPassword = asyncHandler(async (req, res, next) => {
  const user = await User.findByIdAndUpdate(
    req.params.id,
    {
      password: await bcrypt.hash(req.body.password, 12),
      passwordChangedAt: Date.now(),
    },
    {
      new: true,
    }
  );

  if (!user) {
    return next(new ApiError(`No User For This id:${req.params.id}`, 404));
  }

  res.status(201).json({ data: user });
});

// @desc      Delete Specific User Service
// @route     DELETE /api/v1/users/:id
// @access    Private/Admin
exports.deleteUser = factory.deleteOne(User);

// @desc      Get Logged User Data Middleware
// @route     GET /api/v1/users/profile
// @access    Public/Protect
exports.getLoggedUserData = asyncHandler(async (req, res, next) => {
  // get user id from user object in logged user response and inject it into params
  req.params.id = req.user._id;
  next();
});

// @desc      Update Logged User Password
// @route     PUT /api/v1/users/changeMyPassword
// @access    Public/Protect
exports.changeLoggedUserPassword = asyncHandler(async (req, res, next) => {
  // 1- get logged user
  const user = await User.findByIdAndUpdate(
    req.user._id,
    {
      password: await bcrypt.hash(req.body.password, 12),
      passwordChangedAt: Date.now(),
    },
    {
      new: true,
    }
  );

  if (!user) {
    return next(new ApiError(`No User For This id:${req.user._id}`, 404));
  }

  // 2- generate new token
  const token = generateToken(user._id);

  res.status(201).json({ data: user, token });
});

// @desc      Update Logged User Data
// @route     PUT /api/v1/users/updateMyData
// @access    Public/Protect
exports.updateLoggedUserData = asyncHandler(async (req, res, next) => {
  const updatedUser = await User.findByIdAndUpdate(
    req.user._id,
    {
      name: req.body.name,
      slug: req.body.slug,
      email: req.body.email,
      phone: req.body.phone,
    },
    { new: true }
  );

  if (!updatedUser) {
    return next(new ApiError(`No User For This id:${req.params.id}`, 404));
  }

  res.status(201).json({ data: updatedUser });
});

// @desc      Deactivate Logged User
// @route     DELETE /api/v1/users/deleteMe
// @access    Public/Protect
exports.deactivateLoggedUser = asyncHandler(async (req, res, next) => {
  await User.findByIdAndUpdate(req.user._id, { active: false });

  res.status(204).send();
});

// @desc      Activate Logged User
// @route     UPDATE /api/v1/users/activeMe
// @access    Public/Protect
exports.activateLoggedUser = asyncHandler(async (req, res, next) => {
  const user = await User.findOneAndUpdate(
    { email: req.body.email },
    { active: true },
    { new: true }
  );

  res.status(200).json({
    status: "Success",
    message: "The Account Activated Successfully",
    data: user,
  });
});

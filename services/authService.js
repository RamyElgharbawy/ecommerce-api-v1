const crypto = require("crypto");

const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

const asyncHandler = require("express-async-handler");

const ApiError = require("../utils/apiError");
const User = require("../models/userModel");
const sendEmail = require("../utils/sendMail");
const generateToken = require("../utils/createToken");

// @desc      Signup Service
// @route     POST /api/v1/auth/signup
// @access    Public
exports.signup = asyncHandler(async (req, res, next) => {
  // 1- create user
  const user = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
  });

  // 2- generate JWT
  const token = generateToken(user._id);

  res.status(201).json({ data: user, token });
});

// @desc      login Service
// @route     POST /api/v1/auth/login
// @access    Public
exports.login = asyncHandler(async (req, res, next) => {
  // 1- Find user in db
  const user = await User.findOne({
    email: req.body.email,
  });

  // 2- verify email & password
  if (!user || !(await bcrypt.compare(req.body.password, user.password))) {
    return next(new ApiError("Email or Password Incorrect", 401));
  }

  // 3- generate token
  const token = generateToken(user._id);

  res.status(200).json({ data: user, token });
});

// @desc  Authentication service (Permissions)
exports.protect = asyncHandler(async (req, res, next) => {
  // 1- check if there is token & if exist get it.
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }
  if (!token) {
    return next(new ApiError("Please login to access this recourse", 401));
  }

  // 2- verify token (no changes happened, expired time).
  const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);

  // 3- verify user if exist.
  const currentUser = await User.findById(decoded.userId);

  if (!currentUser) {
    return next(new ApiError("This user doesn`t exist", 401));
  }

  // 4- check user password if changed after token created.

  if (currentUser.passwordChangedAt) {
    // convert changed password time format to timestamp format
    const passwordChangedTimeStamp = parseInt(
      currentUser.passwordChangedAt.getTime() / 1000,
      10
    );

    if (passwordChangedTimeStamp > decoded.iat) {
      return next(
        new ApiError(
          "User has recently changed password, please login again",
          401
        )
      );
    }
  }

  // 5- check if user is active
  if (!currentUser.active) {
    return next(
      new ApiError(
        "This Account Deactivated, you cant not access this resource",
        400
      )
    );
  }

  // inject current user into request
  req.user = currentUser;

  next();
});

// @desc  Authorization service [user permissions]
exports.allowedTo = (...roles) =>
  asyncHandler(async (req, res, next) => {
    // if user dos not have permission
    if (!roles.includes(req.user.role)) {
      return next(
        new ApiError("You are not allowed to access this recourse", 403)
      );
    }
    // if user has permission
    next();
  });

// @desc      Forgot Password Service
// @route     POST /api/v1/auth/forgotPassword
// @access    Public
exports.forgotPassword = asyncHandler(async (req, res, next) => {
  // 1- Verify user.
  const user = await User.findOne({ email: req.body.email });

  if (!user) {
    return next(
      new ApiError(`There is no user for this email: ${req.body.email}`, 404)
    );
  }

  // 2- generate reset code with random 6 digits and save it to db.
  // a- generate reset code & convert it to string.
  const resetCode = Math.floor(100000 + Math.random() * 900000).toString();

  // b- hash reset code to save into db.
  const hashedResetCode = crypto
    .createHash("sha256")
    .update(resetCode)
    .digest("hex");

  // c- save hashed reset code into db
  user.passwordResetCode = hashedResetCode;
  // d- create reset code expire time into db
  user.passwordResetCodeExpires = Date.now() + 10 * 60 * 1000;
  // e- create reset code verified status on db
  user.passwordResetVerified = false;
  // f- save user data into db
  await user.save();

  // 3- send reset code via email.
  const massage = `Hi ${user.name}\n
        We Received Request to reset your E-Shop account password\n
        Enter the following code to reset your password.\n
        ${resetCode}\n
        Thanks to helping us to keep your account secure.\n
        E-Shop Team`;

  try {
    await sendEmail({
      email: user.email,
      subject: "Your Password Reset Code (Valid for 10 min)",
      massage,
    });
  } catch (error) {
    // reset fields in db when mail not sent
    user.passwordResetCode = undefined;
    user.passwordResetCodeExpires = undefined;
    user.passwordResetVerified = undefined;

    await user.save();

    return next(new ApiError("There is an Error in sending mail", 500));
  }

  res
    .status(200)
    .json({ status: "Success", massage: "Reset code sent to email" });
});

// @desc      Verify reset code
// @route     POST /api/v1/auth/verifyResetCode
// @access    Public
exports.verifyResetCode = asyncHandler(async (req, res, next) => {
  // hash reset code from body to compare with another in db
  const hashedResetCode = crypto
    .createHash("sha256")
    .update(req.body.resetCode)
    .digest("hex");

  // 1- get user by reset code
  const user = await User.findOne({
    passwordResetCode: hashedResetCode,
    passwordResetCodeExpires: { $gt: Date.now() },
  });

  if (!user) {
    return next(new ApiError("Invalid or Expired Reset code", 500));
  }

  // 2- change verify status on db
  user.passwordResetVerified = true;
  await user.save();

  res.status(200).json({ status: "Success" });
});

// @desc      Reset Password
// @route     POST /api/v1/auth/resetPassword
// @access    Public
exports.resetPassword = asyncHandler(async (req, res, next) => {
  // 1- get user by email
  const user = await User.findOne({ email: req.body.email });

  if (!user) {
    return next(
      new ApiError(`No User For This E-mail: ${req.body.email}`, 404)
    );
  }

  if (!user.passwordResetVerified) {
    return next(new ApiError("Reset Code not Verified", 400));
  }

  // 2- reset password & save it in db
  user.password = req.body.newPassword;
  await user.save();

  // 3- reset password fields in db
  user.passwordResetCode = undefined;
  user.passwordResetCodeExpires = undefined;
  user.passwordResetVerified = undefined;
  await user.save();

  // 4- generate new token
  const token = generateToken(user._id);

  res.status(200).json({ token });
});

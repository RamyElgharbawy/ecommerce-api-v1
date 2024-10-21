const ApiError = require("../utils/apiError");

// @desc    error format for development
const sendErrorForDev = (err, res) =>
  res.status(err.statusCode).json({
    status: err.status,
    error: err,
    message: err.message,
    stack: err.stack,
  });
// @desc    error format for development
const sendErrorForProd = (err, res) =>
  res.status(err.statusCode).json({
    status: err.status,
    message: err.message,
  });

// handle invalid token
const handleInvalidToken = () =>
  new ApiError("Invalid token, please Login again", 401);

// handle invalid token
const handleExpiredToken = () =>
  new ApiError("Expired token, please Login again", 401);

// @desc    global error handling middleware
const globalError = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || "error";
  if (process.env.NODE_ENV === "development") {
    sendErrorForDev(err, res);
  } else {
    if (err.name === "JsonWebTokenError") err = handleInvalidToken();
    if (err.name === "TokenExpiredError") err = handleExpiredToken();
    sendErrorForProd(err, res);
  }
};

module.exports = globalError;

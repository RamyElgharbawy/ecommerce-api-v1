const { validationResult } = require("express-validator");

// @desc  Finds the validation errors in request and wraps them in an object then send them to response.
const validatorMiddleware = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

module.exports = validatorMiddleware;
const ErrorResponse = require("../utils/errorResponse");

const errorHandler = (err, req, res, next) => {
  console.log(req.params)
  let error = { ...err };
  error.message = err.message;

  //log err for dev
  //console.log(err.stack.red);

  //mongoose bag object Id
  if (err.name === "CastError") {
    console.log(req.params)
    const message = `Resource not found with id : ${error.value}`;
    error = new ErrorResponse(message, 404);
  }

  //Mongoose duplicate key
  if (err.code === 11000) {
    const message = "Duplicate feild entered";
    error = new ErrorResponse(message, 400);
  }

  //mongoose validation error
  if (err.name === "ValidationError") {
    error = new ErrorResponse(err.message, 400);
  }

  res
    .status(error.statusCode || 500)
    .json({ success: false, error: error.message || "Server Error" });
};

module.exports = errorHandler;

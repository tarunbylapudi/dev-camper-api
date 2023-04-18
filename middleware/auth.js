const ErrorResponse = require("../utils/errorResponse");
const asyncHandler = require("../middleware/async");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

//protect routes
exports.protect = asyncHandler(async (req, res, next) => {
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }
  //   else if (req.cookies.token) {
  //     token = req.cookies.token;
  //   }

  //makesure the token exists
  if (!token) {
    return next(new ErrorResponse("Not authorize to access this route", 401));
  }

  //verfy token
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log(decoded);
    req.user = await User.findById(decoded.id);
    next();
  } catch (error) {
    return next(new ErrorResponse("Not authorize to access this route", 401));
  }
});

//role authorization

exports.authorize = (...roles) => {
  return (req, res, next) => {
    console.log(req.user)
    if (!roles.includes(req.user.role)) {
      return next(
        new ErrorResponse(
          `user role ${req.user.role} do not have permission to access this route`,
          403
        )
      );
      
    }
    next();
  };
};

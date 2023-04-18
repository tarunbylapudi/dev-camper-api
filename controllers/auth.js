const Bootcamp = require("../models/User");
const ErrorResponse = require("../utils/errorResponse");
const asyncHandler = require("../middleware/async");
const User = require("../models/User");

// @desc      register user
// @route     POST /api/v1/auth/register
// @access    Public
exports.register = asyncHandler(async (req, res, next) => {
  const { name, email, password, role } = req.body;

  const user = await User.create({ name, email, password, role });

  //send token with cookie
  sendTokenResponse(user, 200, res);
});

// @desc      login user
// @route     POST /api/v1/auth/login
// @access    Public
exports.login = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;

  //validate email & password
  if (!email || !password) {
    return next(
      new ErrorResponse("Please provide an email and a password", 400)
    );
  }

  //check for the user

  const user = await User.findOne({ email }).select("+password");

  if (!user) {
    return next(new ErrorResponse("unregistered User", 400));
  }

  //check for password match
  const isMatch = await user.matchPassword(password);

  if (!isMatch) {
    return next(new ErrorResponse("invalid credentials", 400));
  }

  //send token with cookie
  sendTokenResponse(user, 200, res);
});

//get token from the model ,create a cookie and send response

const sendTokenResponse = (user, statusCode, res) => {
  //create token
  const token = user.getSignedJwtToken();

  const options = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRE * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
  };

  if (process.env.NODE_ENV === "production") {
    options.secure = true;
  }

  return res
    .status(statusCode)
    .cookie("token", token, options)
    .json({ success: true, token });
};

// @desc      get current logged in user
// @route     POST /api/v1/auth/me
// @access    private
exports.getMe = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user.id);
  res.status(200).json({ success: true, data: user });
});

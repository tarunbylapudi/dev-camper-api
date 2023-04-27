const ErrorResponse = require("../utils/errorResponse");
const asyncHandler = require("../middleware/async");
const User = require("../models/User");
const sendMail = require("../utils/sendMail");
const crypto = require("crypto");

// @desc      register user
// @route     POST /api/v1/auth/register
// @access    Public
exports.register = asyncHandler(async (req, res, next) => {
  const { name, email, password, role } = req.body;

  const user = await User.create({ name, email, password, role });

  //send token with cookie
  sendTokenResponse(user, 200, res);
});

// @desc      logout user/clear cookie
// @route     GET /api/v1/auth/logout
// @access    private
exports.logout = asyncHandler(async (req, res, next) => {
  res.cookie("token", "none", {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
  });

  res.status(200).json({ success: true, data: {} });
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

// @desc      get current logged in user
// @route     POST /api/v1/auth/me
// @access    private
exports.getMe = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user.id);
  res.status(200).json({ success: true, data: user });
});

// @desc      forgot password
// @route     POST /api/v1/auth/forgotPassword
// @access    public
exports.forgotPassword = asyncHandler(async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email });

  if (!user) {
    return next(
      new ErrorResponse(`No user found with email ${req.body.email}`, 400)
    );
  }

  //get reset token
  const resetToken = user.getResetPasswordToken();

  console.log("resetToken :", resetToken);

  await user.save({ validateBeforeSave: false });

  //create reset url
  const resetURL = `${req.protocol}://${req.get(
    "host"
  )}/api/v1/auth/resetPassword/${resetToken}`;

  const message = `you are reciving this mail for resetting your password, to do so please send a PUT request to ${resetURL}`;

  //send mail

  try {
    await sendMail({ email: user.email, subject: "reset password", message });
    return res.status(200).json({ success: true, data: "email sent" });
  } catch (error) {
    console.log(error);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save({ validateBeforeSave: false });
    return next(new ErrorResponse("email could not be sent!", 500));
  }

  res.status(200).json({ success: true, data: user });
});

// @desc      reset password
// @route     PUT /api/v1/auth/resetPassword/:resetToken
// @access    public
exports.resetPassword = asyncHandler(async (req, res, next) => {
  //get hashed token
  const resetPasswordToken = crypto
    .createHash("sha256")
    .update(req.params.resetToken)
    .digest("hex");

  //get the user
  const user = await User.findOne({
    resetPasswordToken,
    resetPasswordExpire: { $gt: Date.now() },
  });

  if (!user) {
    return next(new ErrorResponse("Invalid Token!", 500));
  }

  //set new password
  user.password = req.body.password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;
  await user.save();

  sendTokenResponse(user, 200, res);
});

// @desc      update user details
// @route     PUT /api/v1/auth/updateDetails
// @access    private
exports.updateDetails = asyncHandler(async (req, res, next) => {
  const feildsToUpdate = { name: req.body.name, email: req.body.email };

  const user = await User.findByIdAndUpdate(req.user.id, feildsToUpdate, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({ success: true, data: user });
});

// @desc      update password
// @route     PUT /api/v1/auth/updatePassword
// @access    private
exports.updatePassword = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user.id).select("+password");

  //check for current password
  if (!(await user.matchPassword(req.body.currentPassword))) {
    return next(new ErrorResponse("password is incorrect!", 401));
  }

  user.password = req.body.newPassword;
  await user.save();

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

const express = require("express");
const {
  register,
  login,
  getMe,
  forgotPassword,
  resetPassword,
  updateDetails,
  updatePassword,
  logout,
} = require("../controllers/auth");
const { protect } = require("../middleware/auth");

const router = express.Router();

router.route("/register").post(register);

router.route("/login").post(login);

router.route("/logout").get(logout);

router.route("/me").get(protect, getMe);

router.route("/forgotPassword").post(forgotPassword);

router.route("/resetPassword/:resetToken").put(resetPassword);

router.route("/updateDetails").put(protect, updateDetails);

router.route("/updatePassword").put(protect, updatePassword);

module.exports = router;

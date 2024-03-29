const ErrorResponse = require("../utils/errorResponse");
const asyncHandler = require("../middleware/async");
const Course = require("../models/Course");
const Bootcamp = require("../models/Bootcamp");

// @desc      Get courses
// @route     GET /api/v1/courses
// @route     GET /api/v1/bootcamps/:bootcampId/courses
// @access    Public
exports.getCourses = asyncHandler(async (req, res, next) => {
  if (req.params.bootcampId) {
    courses = Course.find({ bootcamp: req.params.bootcampId }).populate({
      path: "bootcamp",
      select: "name description",
    });

    return res
      .status(200)
      .json({ success: true, count: courses.length, data: courses });
  } else {
    res.status(200).json(res.advancedResults);
  }
});

// @desc      Get course
// @route     GET /api/v1/course/:id
// @access    Public
exports.getCourse = asyncHandler(async (req, res, next) => {
  const course = await Course.findById(req.params.id).populate({
    path: "bootcamp",
    select: "name description",
  });

  if (!course) {
    return next(
      new ErrorResponse(`No course found with id ${req.params.id}`, 404)
    );
  }
  res.status(200).json({ success: true, data: course });
});

// @desc      Add course
// @route     POST /api/v1/bootcamps/:bootcampId/courses
// @access    Private
exports.addCourse = asyncHandler(async (req, res, next) => {
  req.body.user = req.user.id;

  const bootcamp = await Bootcamp.findById(req.params.bootcampId);

  if (!bootcamp) {
    return next(
      new ErrorResponse(
        `No bootcamp found with id ${req.params.bootcampId}`,
        404
      )
    );
  }

  //make sure the user is the bootcamp owner
  if (bootcamp.user.toString() !== req.user.id && req.user.role !== "admin") {
    return next(
      new ErrorResponse(
        `User with id ${req.user.id} is not authorized to add course to this bootcamp ${bootcamp._id}`,
        400
      )
    );
  }

  req.body.bootcamp = req.params.bootcampId;

  const course = await Course.create(req.body);

  res.status(200).json({ success: true, data: course });
});

// @desc      Update course
// @route     PUT /api/v1/courses/:id
// @access    Private
exports.updateCourse = asyncHandler(async (req, res, next) => {
  let course = await Course.findById(req.params.id);

  if (!course) {
    return next(
      new ErrorResponse(`No course found with id ${req.params.id}`, 404)
    );
  }

  //make sure the user is the course owner
  if (course.user.toString() !== req.user.id && req.user.role !== "admin") {
    return next(
      new ErrorResponse(
        `User with id ${req.user.id} is not authorized to update course ${course._id}`,
        401
      )
    );
  }

  course = await Course.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({ success: true, data: course });
});

// @desc      delete course
// @route     DELETE /api/v1/courses/:id
// @access    Private
exports.deleteCourse = asyncHandler(async (req, res, next) => {
  let course = await Course.findById(req.params.id);

  if (!course) {
    return next(
      new ErrorResponse(`No course found with id ${req.params.id}`, 404)
    );
  }

  //make sure the user is the course owner
  if (course.user.toString() !== req.user.id && req.user.role !== "admin") {
    return next(
      new ErrorResponse(
        `User with id ${req.user.id} is not authorized to delete course ${course._id}`,
        401
      )
    );
  }

  await Course.findByIdAndDelete(req.params.id);
  res.status(200).json({ success: true, data: {} });
});

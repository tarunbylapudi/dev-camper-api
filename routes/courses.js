const express = require("express");

const Course = require("../models/Course");
const advancedResults = require("../middleware/advancedResults");

const {
  getCourses,
  getCourse,
  addCourse,
  updateCourse,
  deleteCourse,
} = require("../controllers/courses");

const { protect, authorize } = require("../middleware/auth");

const router = express.Router({ mergeParams: true });

router
  .route("/")
  .get(
    advancedResults(Course, { path: "bootcamp", select: "title description" }),
    getCourses
  )
  .post(protect,authorize("publisher", "admin"), addCourse);

router
  .route("/:id")
  .get(getCourse)
  .put(protect,authorize("publisher", "admin"), updateCourse)
  .delete(protect,authorize("publisher", "admin"), deleteCourse);

module.exports = router;

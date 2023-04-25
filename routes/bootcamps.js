const express = require("express");

const advancedResults = require("../middleware/advancedResults");
const Bootcamp = require("../models/Bootcamp");

const {
  getBootCamps,
  getBootCamp,
  createBootCamp,
  updateBootCamp,
  deleteBootCamp,
  getBootCampsWithInRadius,
  bootcampPhotoUpload,
} = require("../controllers/bootcamp");

const { protect, authorize } = require("../middleware/auth");

const courseRouter = require("./courses");
const reviewRouter = require("./reviews");

const router = express.Router();

//re-routing into other routers
router.use("/:bootcampId/courses", courseRouter);
router.use("/:bootcampId/reviews", reviewRouter);

router.route("/radius/:zipcode/:distance").get(getBootCampsWithInRadius);

router
  .route("/")
  .get(advancedResults(Bootcamp, "courses"), getBootCamps)
  .post(protect, authorize("publisher", "admin"), createBootCamp);

router
  .route("/:id")
  .get(getBootCamp)
  .put(protect, authorize("publisher", "admin"), updateBootCamp)
  .delete(protect, authorize("publisher", "admin"), deleteBootCamp);

router
  .route("/:id/photo")
  .put(protect, authorize("publisher", "admin"), bootcampPhotoUpload);

module.exports = router;

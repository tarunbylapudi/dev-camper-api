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

const courseRouter = require("./courses");

const router = express.Router();

//re-routing into other routers
router.use("/:bootcampId/courses", courseRouter);

router.route("/radius/:zipcode/:distance").get(getBootCampsWithInRadius);

router
  .route("/")
  .get(advancedResults(Bootcamp, "courses"), getBootCamps)
  .post(createBootCamp);

router
  .route("/:id")
  .get(getBootCamp)
  .put(updateBootCamp)
  .delete(deleteBootCamp);

router.route("/:id/photo").put(bootcampPhotoUpload);

module.exports = router;

const express = require("express");

const {
  getBootCamps,
  getBootCamp,
  createBootCamp,
  updateBootCamp,
  deleteBootCamp,
  getBootCampsWithInRadius,
} = require("../controllers/bootcamp");

const router = express.Router();

router.route("/radius/:zipcode/:distance").get(getBootCampsWithInRadius);

router.route("/").get(getBootCamps).post(createBootCamp);

router
  .route("/:id")
  .get(getBootCamp)
  .put(updateBootCamp)
  .delete(deleteBootCamp);

module.exports = router;

const path = require("path");

const Bootcamp = require("../models/Bootcamp");
const ErrorResponse = require("../utils/errorResponse");
const asyncHandler = require("../middleware/async");
const geocoder = require("../utils/geoCoder");

const advancedResults = require("../middleware/advancedResults");

exports.getBootCamps = asyncHandler(async (req, res, next) => {
  //send response
  res.status(200).json(res.advancedResults);
});

exports.getBootCampsWithInRadius = asyncHandler(async (req, res, next) => {
  const { zipcode, distance } = req.params;

  // Get lat/lng from geocoder
  const loc = await geocoder.geocode(zipcode);
  const lat = loc[0].latitude;
  const lng = loc[0].longitude;

  // Calc radius using radians
  // Divide dist by radius of Earth
  // Earth Radius = 3,963 mi / 6,378 km
  const radius = distance / 3963;

  const bootcamps = await Bootcamp.find({
    location: { $geoWithin: { $centerSphere: [[lng, lat], radius] } },
  });

  //send response

  res.status(200).json({
    success: true,
    count: bootcamps.length,
    data: bootcamps,
  });
});

exports.getBootCamp = asyncHandler(async (req, res, next) => {
  const bootcamp = await Bootcamp.findById(req.params.id);
  if (!bootcamp) {
    return next(
      new ErrorResponse(`Bootcamp not found with id : ${req.params.id}`, 404)
    );
  }

  res.status(200).json({ success: true, data: bootcamp });
});

exports.createBootCamp = asyncHandler(async (req, res, next) => {
  // add user to therequest.body
  req.body.user = req.user.id;

  // check for published bootcamp
  const publishedBootcamp = await Bootcamp.findOne({ user: req.user.id });

  // if the user role is not admin they can publish only one bootcamp
  if (publishedBootcamp && req.user.role !== "admin") {
    return next(
      new ErrorResponse(
        `User with id ${req.user.id} has already published a bootcamp`,
        400
      )
    );
  }

  const bootcamp = await Bootcamp.create(req.body);

  res.status(201).json({ success: true, data: bootcamp });
});

exports.updateBootCamp = asyncHandler(async (req, res, next) => {
  let bootcamp = await Bootcamp.findById(req.params.id);

  if (!bootcamp) {
    return next(
      new ErrorResponse(`Bootcamp not found with id : ${req.params.id}`, 404)
    );
  }

  //make sure the user is the bootcamp owner
  if (bootcamp.user.toString() !== req.user.id && req.user.role !== "admin") {
    return next(
      new ErrorResponse(
        `User with id ${req.user.id} is not authorized to update this bootcamp`,
        400
      )
    );
  }

  bootcamp = await Bootcamp.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({ success: true, data: bootcamp });
});

exports.deleteBootCamp = asyncHandler(async (req, res, next) => {
  const bootcamp = await Bootcamp.findById(req.params.id);
  if (!bootcamp) {
    return next(
      new ErrorResponse(`Bootcamp not found with id : ${req.params.id}`, 404)
    );
  }

  //make sure the user is the bootcamp owner
  if (bootcamp.user.toString() !== req.user.id && req.user.role !== "admin") {
    return next(
      new ErrorResponse(
        `User with id ${req.user.id} is not authorized to delete this bootcamp`,
        400
      )
    );
  }

  bootcamp.deleteOne();
  res.status(200).json({ success: true, data: {} });
});

// @desc      Upload photo for bootcamp
// @route     PUT /api/v1/bootcamps/:id/photo
// @access    Private
exports.bootcampPhotoUpload = asyncHandler(async (req, res, next) => {
  let bootcamp = await Bootcamp.findById(req.params.id);

  if (!bootcamp) {
    return next(
      new ErrorResponse(`No bootcamp found with id ${req.params.id}`, 404)
    );
  }

  //make sure the user is the bootcamp owner
  if (bootcamp.user.toString() !== req.user.id && req.user.role !== "admin") {
    return next(
      new ErrorResponse(
        `User with id ${req.user.id} is not authorized to update this bootcamp`,
        400
      )
    );
  }

  if (!req.files) {
    return next(new ErrorResponse("Please upload a photo!", 404));
  }

  const file = req.files.file;

  //make sure the file is a photo
  if (!file.mimetype.startsWith("image")) {
    return next(new ErrorResponse("Please upload a image file!", 404));
  }

  //check file size
  if (file.size > process.env.MAX_UPLOAD_FILE_SIZE) {
    return next(
      new ErrorResponse(
        `Please upload an image lessthan ${process.env.MAX_UPLOAD_FILE_SIZE}`,
        404
      )
    );
  }

  //creating coustom name
  file.name = `photo_${bootcamp._id}${path.parse(file.name).ext}`;

  //moving the photo to public folder
  file.mv(`${process.env.FILE_UPLOAD_PATH}/${file.name}`, async (error) => {
    if (error) {
      console.log(error);
      return next(
        new ErrorResponse(
          "problem with file upload!, please try again later",
          400
        )
      );
    }
  });

  //updating the photo feild in Bootcamp

  await Bootcamp.findByIdAndUpdate(req.params.id, { photo: file.name });

  console.log(file.name);

  //course.findOneAndDelete();
  res.status(200).json({ success: true, data: file.name });
});

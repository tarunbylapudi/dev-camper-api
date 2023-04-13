const Bootcamp = require("../models/Bootcamp");
const ErrorResponse = require("../utils/errorResponse");
const asyncHandler = require("../middleware/async");
const geocoder = require("../utils/geoCoder");

exports.getBootCamps = asyncHandler(async (req, res, next) => {
  let query;

  //copy query params
  const reqQuery = { ...req.query };

  //exclude feilds
  const removeFeilds = ["select", "sort", "page", "limit"];

  //loop over and delete the feilds from the reqQuery
  removeFeilds.forEach((param) => delete reqQuery[param]);

  //create queryString
  let queryString = JSON.stringify(reqQuery);

  //Create Operater
  queryString = queryString.replace(
    /\b(gt|gte|lt|lte|in|eq|ne|nin)\b/g,
    (match) => `$${match}`
  );

  // Finding resorce
  query = Bootcamp.find(JSON.parse(queryString));

  //select feilds
  if (req.query.select) {
    const feilds = req.query.select.split(",").join(" ");
    query = query.select(feilds);
  }

  //sort feilds

  if (req.query.sort) {
    const sortBy = req.query.sort.split(",").join(" ");
    query = query.sort(sortBy);
  } else {
    query = query.sort("-createdAt");
  }

  //pagination logic

  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 25;
  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;
  const total = await Bootcamp.countDocuments();

  query = query.skip(startIndex).limit(limit);

  //exicute query
  const bootcamps = await query;

  //pagination result

  const pagination = {};

  if (endIndex < total) {
    pagination.next = { page: page + 1, limit };
  }

  if (startIndex > 0) {
    pagination.prev = { page: page - 1, limit };
  }

  //send response
  res.status(200).json({
    success: true,
    count: bootcamps.length,
    pagination,
    data: bootcamps,
  });
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
  const bootcamp = await Bootcamp.create(req.body);
  res.status(201).json({ success: true, data: bootcamp });
});

exports.updateBootCamp = asyncHandler(async (req, res, next) => {
  const bootcamp = await Bootcamp.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!bootcamp) {
    return next(
      new ErrorResponse(`Bootcamp not found with id : ${req.params.id}`, 404)
    );
  }

  res.status(200).json({ success: true, data: bootcamp });
});

exports.deleteBootCamp = asyncHandler(async (req, res, next) => {
  const bootcamp = await Bootcamp.findByIdAndDelete(req.params.id);
  if (!bootcamp) {
    return next(
      new ErrorResponse(`Bootcamp not found with id : ${req.params.id}`, 404)
    );
  }

  res.status(200).json({ success: true, data: {} });
});

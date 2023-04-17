const advancedResults = (model, populate) => async (req, res, next) => {
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
  query = model.find(JSON.parse(queryString));

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
  const total = await model.countDocuments();

  query = query.skip(startIndex).limit(limit);

  if (populate) {
    query = query.populate(populate);
  }

  //exicute query
  const results = await query;

  //pagination result

  const pagination = {};

  if (endIndex < total) {
    pagination.next = { page: page + 1, limit };
  }

  if (startIndex > 0) {
    pagination.prev = { page: page - 1, limit };
  }

  res.advancedResults = {
    success: true,
    count: results.length,
    pagination,
    data: results,
  };

  //console.log(res.advancedResults)

  next();
};

module.exports = advancedResults;

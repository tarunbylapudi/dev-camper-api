const NodeGeocoder = require("node-geocoder");

const options = {
  //provider: process.env.GEO_CODER_PROVIDER,
  provider: "openstreetmap",
  formatter: null,
};

const geocoder = NodeGeocoder(options);

module.exports = geocoder;

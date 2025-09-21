const axios = require("axios");

const HttpError = require("../models/http-error");

const API_KEY = process.env.LOCATION_IQ_API_KEY;

const getCoordsForAddress = async (address) => {
  const response = await axios.get(
    `https://us1.locationiq.com/v1/search?key=${API_KEY}&q=${address}&format=json`
  );

  const data = response.data;

  if (!data || data.error || data.length === 0) {
    return next(
      new HttpError("Could not fetch coordinates for the address.", 422)
    );
  }

  const coorLat = data[0].lat;
  const coorLon = data[0].lon;
  const coordinates = {
    lat: coorLat,
    lng: coorLon,
  };
  return coordinates;
};

module.exports = getCoordsForAddress;

const { validationResult } = require("express-validator");
const mongoose = require("mongoose");
const path = require("path");
const fs = require("fs");
const cloudinary = require("cloudinary").v2;

const HttpError = require("../models/http-error");
const getCoordsForAddress = require("../util/location");
const Place = require("../models/place");
const User = require("../models/user");

// GET PLACE BY ID *****************

const getPlaceById = async (req, res, next) => {
  const placeId = req.params.pId;

  let place;
  try {
    place = await Place.findById(placeId);
  } catch (err) {
    const error = new HttpError(
      "Something went wrong! Could not find a place",
      500
    );
    return next(error);
  }

  if (!place || place.length === 0) {
    const error = new HttpError(
      "Could not find a place by the provided id",
      404
    );
    return next(error);
  }

  res.json({ place: place.toObject({ getters: true }) });
};

// GET PLACE BY USER ID *****************

const getPlacesByUserId = async (req, res, next) => {
  const userId = req.params.uId;

  let userWithPlaces;
  try {
    userWithPlaces = await User.findById(userId).populate("places");
  } catch (err) {
    console.error(err);
    const error = new HttpError("Fetching places failed!", 500);
    return next(error);
  }

  if (!userWithPlaces) {
    return next(
      new HttpError("Could not find places by the provided user id", 404)
    );
  }
  res.json({
    places: userWithPlaces.places.map((place) =>
      place.toObject({ getters: true })
    ),
  });
};

// CREATE PLACE *****************

const createPlace = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log(errors);
    return next(new HttpError("Invalid input", 422));
  }

  const { title, description, address } = req.body;

  let coordinates;
  try {
    coordinates = await getCoordsForAddress(address);
  } catch (err) {
    const error = new HttpError(
      "Co-ordinates not found! Try changing address",
      500
    );
    return next(error);
  }

  let imageUrl = null;
  if (req.file) {
    try {
      const uploadResult = await cloudinary.uploader.upload(req.file.path);

      fs.unlink(req.file.path, (err) => {
        if (err) console.error("Failed to delete local file:", err);
      });

      imageUrl = uploadResult.secure_url;
    } catch (err) {
      const error = new HttpError("Image upload failed!", 500);
      return next(error);
    }
  }

  const createdPlace = new Place({
    title,
    description,
    address,
    location: coordinates,
    image: imageUrl,
    creator: req.userData.userId,
  });

  let user;
  try {
    user = await User.findById(req.userData.userId);
  } catch (err) {
    const error = new HttpError("Creating place failed!", 500);
    return next(error);
  }

  if (!user) {
    const error = new HttpError("Could not find user for the provided id", 404);
    return next(error);
  }

  try {
    const sess = await mongoose.startSession();
    sess.startTransaction();
    await createdPlace.save({ session: sess });
    user.places.push(createdPlace);
    await user.save({ session: sess });
    await sess.commitTransaction();
  } catch (err) {
    const error = new HttpError("Creating place failed!", 500);
    return next(error);
  }
  console.log("created place!!!!!!!!!!", createdPlace);

  res.status(201).json({ place: createdPlace.toObject({ getters: true }) });
};

// UPDATE PLACE *****************

const updatePlace = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log(errors);
    const error = new HttpError("Invalid input!", 422);
    return next(error);
  }

  const { title, description } = req.body;
  const placeId = req.params.pId;

  let place;
  try {
    place = await Place.findById(placeId);
  } catch (err) {
    const error = new HttpError(
      "Something went wrong! Could not find the place",
      500
    );
    return next(error);
  }

  if (place.creator.toString() !== req.userData.userId) {
    const error = new HttpError("You are not allowed to edit this Place", 401);
    return next(error);
  }

  place.title = title;
  place.description = description;

  try {
    await place.save();
  } catch (err) {
    const error = new HttpError(
      "Something went wrong! Could not update place",
      500
    );
    return next(error);
  }

  res.status(200).json({ place: place.toObject({ getters: true }) });
};

// DELETE PLACE *****************

const deletePlace = async (req, res, next) => {
  const placeId = req.params.pId;

  let place;
  try {
    place = await Place.findById(placeId).populate("creator");
  } catch (err) {
    const error = new HttpError(
      "Something went wrong! Could not delete place.",
      500
    );
    return next(error);
  }

  if (!place) {
    const error = new HttpError("Could not find place!", 500);
    return next(error);
  }

  if (place.creator.id !== req.userData.userId) {
    const error = new HttpError(
      "You are not allowed to delete this Place",
      401
    );
    return next(error);
  }

  let imagePath = place.image;

  const getPublicIdFromUrl = (url) => {
    const parts = url.split("/");
    const fileName = parts[parts.length - 1];
    const publicId = fileName.split(".")[0];
    return publicId;
  };

  try {
    const sess = await mongoose.startSession();
    sess.startTransaction();
    await place.deleteOne({ session: sess });
    place.creator.places.pull(place);
    await place.creator.save({ session: sess });
    await sess.commitTransaction();
  } catch (err) {
    const error = new HttpError(
      "Something went wrong! Could not delete place.",
      500
    );
    return next(error);
  }

  const publicId = getPublicIdFromUrl(imagePath);

  try {
    await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    const err = new HttpError("Failed to delete image from cloud", 500);
    return next(err);
  }

  res.status(200).json({ message: "Deleted Place!" });
};

exports.getPlaceById = getPlaceById;
exports.getPlacesByUserId = getPlacesByUserId;
exports.createPlace = createPlace;
exports.updatePlace = updatePlace;
exports.deletePlace = deletePlace;

const { validationResult } = require("express-validator");
const mongoose = require("mongoose");
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
    return next(
      new HttpError("Something went wrong! Could not find a place", 500)
    );
  }

  if (!place) {
    return next(
      new HttpError("Could not find a place by the provided id", 404)
    );
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
    return next(new HttpError("Fetching places failed!", 500));
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
    return next(new HttpError("Invalid input", 422));
  }

  const { title, description, address } = req.body;

  let coordinates;
  try {
    coordinates = await getCoordsForAddress(address);
  } catch (err) {
    return next(
      new HttpError("Co-ordinates not found! Try changing address", 500)
    );
  }

  if (!req.file) return next(new HttpError("Place image is required", 422));

  let imageUrl;
  try {
    const uploadResult = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: "Placebook_Places",
        },
        (err, result) => (err ? reject(err) : resolve(result))
      );
      uploadStream.end(req.file.buffer);
    });

    imageUrl = uploadResult.secure_url;
  } catch (err) {
    return next(new HttpError("Image upload failed!", 500));
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
    return next(new HttpError("Creating place failed!", 500));
  }

  if (!user) {
    return next(new HttpError("Could not find user for the provided id", 404));
  }

  try {
    const sess = await mongoose.startSession();
    sess.startTransaction();
    await createdPlace.save({ session: sess });
    user.places.push(createdPlace);
    await user.save({ session: sess });
    await sess.commitTransaction();
  } catch (err) {
    return next(new HttpError("Creating place failed!", 500));
  }

  res.status(201).json({ place: createdPlace.toObject({ getters: true }) });
};

// UPDATE PLACE *****************

const updatePlace = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(new HttpError("Invalid input!", 422));
  }

  const { title, description } = req.body;
  const placeId = req.params.pId;

  let place;
  try {
    place = await Place.findById(placeId);
  } catch (err) {
    return next(
      new HttpError("Something went wrong! Could not find the place", 500)
    );
  }

  if (place.creator.toString() !== req.userData.userId) {
    return next(new HttpError("You are not allowed to edit this Place", 401));
  }

  place.title = title;
  place.description = description;

  try {
    await place.save();
  } catch (err) {
    return next(
      new HttpError("Something went wrong! Could not update place", 500)
    );
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
    return next(
      new HttpError("Something went wrong! Could not delete place.", 500)
    );
  }

  if (!place) {
    return next(new HttpError("Could not find place!", 404));
  }

  if (place.creator.id !== req.userData.userId) {
    return next(new HttpError("You are not allowed to delete this Place", 401));
  }

  const getPublicIdFromUrl = (url) => {
    const parts = url.split("/");
    const folderAndFile = parts
      .slice(parts.indexOf("Placebook_Places"))
      .join("/")
      .split(".")[0];
    return folderAndFile;
  };

  const publicId = getPublicIdFromUrl(place.image);

  try {
    const sess = await mongoose.startSession();
    sess.startTransaction();
    await place.deleteOne({ session: sess });
    place.creator.places.pull(place);
    await place.creator.save({ session: sess });
    await sess.commitTransaction();
  } catch (err) {
    return next(
      new HttpError("Something went wrong! Could not delete place.", 500)
    );
  }

  try {
    await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    console.error("Cloudinary delete error:", error);
  }

  res.status(200).json({ message: "Deleted Place!" });
};

exports.getPlaceById = getPlaceById;
exports.getPlacesByUserId = getPlacesByUserId;
exports.createPlace = createPlace;
exports.updatePlace = updatePlace;
exports.deletePlace = deletePlace;

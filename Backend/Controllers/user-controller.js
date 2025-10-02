const { validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const cloudinary = require("cloudinary").v2;

const HttpError = require("../models/http-error");
const User = require("../models/user");

// GET USERS *****************

const getUsers = async (req, res, next) => {
  let users;
  try {
    users = await User.find({}, "-password");
  } catch (err) {
    return next(new HttpError("Fetching users failed!", 500));
  }

  res.json({ users: users.map((user) => user.toObject({ getters: true })) });
};

// SIGN UP *****************

const signup = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(new HttpError("Invalid input", 422));
  }

  const { name, email, password } = req.body;

  let existingUser;
  try {
    existingUser = await User.findOne({ email: email });
  } catch (err) {
    return next(new HttpError("Signing up failed!", 500));
  }

  if (existingUser) {
    return next(new HttpError("User already exists!", 422));
  }

  let hashedPassword;
  try {
    hashedPassword = await bcrypt.hash(password, 12);
  } catch (err) {
    return next(new HttpError("Password hashing failed!", 500));
  }

  if (!req.file) return next(new HttpError("Profile image is required", 422));

  let imageUrl;
  try {
    const uploadResult = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: "Placebook_Profile_Pictures", // or "Placebook_Places"
          resource_type: "image", // explicitly mention this if you upload images only
        },
        (error, result) => {
          if (error) {
            reject(error);
          } else {
            resolve(result);
          }
        }
      );
      if (!req.file || !req.file.buffer) {
        reject(new Error("No file buffer found in request"));
      }
      uploadStream.end(req.file.buffer);
    });
    imageUrl = uploadResult.secure_url;
  } catch (err) {
    return next(new HttpError("Image upload failed!", 500));
  }

  const createdUser = new User({
    name,
    email,
    password: hashedPassword,
    image: imageUrl,
    places: [],
  });

  try {
    await createdUser.save();
  } catch (err) {
    return next(
      new HttpError("Something went wrong! Could not create user", 500)
    );
  }

  let token;
  try {
    token = jwt.sign(
      { userId: createdUser.id, email: createdUser.email },
      process.env.JWT_KEY,
      { expiresIn: "1h" }
    );
  } catch (err) {
    return next(
      new HttpError("Something went wrong! Could not create user", 500)
    );
  }
  res
    .status(201)
    .json({ userId: createdUser.id, email: createdUser.email, token: token });
};

// LOG IN *****************

const login = async (req, res, next) => {
  const { email, password } = req.body;

  let user;
  try {
    user = await User.findOne({ email: email });
  } catch (err) {
    return next(new HttpError("Login failed!", 500));
  }

  if (!user) {
    return next(new HttpError("User does not exist! Switch to Sign Up", 403));
  }

  let isValidPassword;
  try {
    isValidPassword = await bcrypt.compare(password, user.password);
  } catch (err) {
    return next(new HttpError("Invalid credentials!", 403));
  }

  let token;
  try {
    token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_KEY,
      { expiresIn: "1h" }
    );
  } catch (err) {
    return next(new HttpError("Something went wrong! Could not Log in", 500));
  }

  res.json({ userId: user.id, email: user.email, token: token });
};

exports.getUsers = getUsers;
exports.signup = signup;
exports.login = login;

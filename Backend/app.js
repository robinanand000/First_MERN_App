const express = require("express");
const bodyParser = require("body-parser");
const HttpError = require("./models/http-error");
require("dotenv").config();
const mongoose = require("mongoose");
const fs = require("fs");

const placesRoutes = require("./routes/places-routes");
const usersRoutes = require("./routes/users-routes");
const path = require("path");

const app = express();

app.use("/uploads/images", express.static(path.join("uploads", "images")));
app.use(bodyParser.json());

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PATCH, DELETE");

  next();
});

app.use("/api/places", placesRoutes);
app.use("/api/users", usersRoutes);

app.use((req, res, next) => {
  const error = new HttpError("Could not find the Route!", 404);
  throw error;
});

app.use((error, req, res, next) => {
  if (req.file) {
    fs.unlink(req.file.path, (err) => {
      console.log("File Delete Error", err);
    });
  }
  if (res.headerSent) {
    return next(error);
  }
  const statusCode = typeof error.code === "number" ? error.code : 500;
  res
    .status(statusCode)
    .json({ message: error.message || "An unknown error occured!" });
});

mongoose
  .connect(
    `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.hh0cucb.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority&appName=Cluster0`
  )
  .then(() => {
    const PORT = process.env.PORT || 5000;
    app.listen(PORT);
  })
  .catch((err) => {
    console.log(err);
  });

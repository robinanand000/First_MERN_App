const express = require("express");
const { check } = require("express-validator");

const placesControllers = require("../Controllers/places-controller");
const fileUpload = require("../middlewares/file-upload");
const checkAuth = require("../middlewares/check-auth");

const router = express.Router();

router.get("/:pId", placesControllers.getPlaceById);

router.get("/user/:uId", placesControllers.getPlacesByUserId);

router.use(checkAuth);

router.post(
  "/",
  fileUpload.single("image"),
  [
    check("title").not().isEmpty(),
    check("description").isLength({ min: 5 }),
    check("address").not().isEmpty(),
  ],
  placesControllers.createPlace
);

router.patch(
  "/:pId",
  [check("title").not().isEmpty(), check("description").isLength({ min: 5 })],
  placesControllers.updatePlace
);

router.delete("/:pId", placesControllers.deletePlace);

module.exports = router;

const express = require("express");
const { check } = require("express-validator");

const userControllers = require("../Controllers/user-controller");
const fileUpload = require("../middlewares/file-upload");

const router = express.Router();

router.get("/", userControllers.getUsers);

router.post(
  "/signup",
  fileUpload.single("image"),
  [
    check("name").not().isEmpty(),
    check("email").normalizeEmail().isEmail(),
    check("password").isLength({ min: 8 }),
  ],
  userControllers.signup
);

router.post("/login", userControllers.login);

module.exports = router;

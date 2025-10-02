const multer = require("multer");

const MIME_TYPE_MAP = {
  "image/png": "png",
  "image/jpeg": "jpeg",
  "image/jpg": "jpg",
};

const fileUpload = multer({
  limits: { fileSize: 50 * 1024 * 1024 },
  storage: multer.memoryStorage(),
  fileFilter: (req, file, cb) => {
    const isValid = !!MIME_TYPE_MAP[file.mimetype];
    let error = isValid
      ? null
      : new Error("Only .png, .jpg, and .jpeg formats are allowed!");
    cb(error, isValid);
  },
});

module.exports = fileUpload;

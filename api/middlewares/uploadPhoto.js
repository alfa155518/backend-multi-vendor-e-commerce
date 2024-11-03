const multer = require("multer");
const path = require("path");
const fs = require("fs");

// 1) uploader PAh
const uploadDir = path.join(__dirname, "../uploads");

// 2) Check Path Already Exit
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// 3) Define storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    if (file) {
      cb(null, new Date().toISOString().replace(/:/g, "-") + file.originalname);
    } else {
      cb(null, false);
    }
  },
});

// 4) Filter File
function fileFilter(req, file, cb) {
  if (file.mimetype.startsWith("image")) {
    cb(null, true);
  } else {
    return cb(new Error("Not an image! Please upload only images."), false);
  }
}

// 5) Define upload middleware
const upload = multer({ storage, fileFilter }).single("photo");

// 6) Define upload img middleware
function uploadImg(req, res, next) {
  upload(req, res, function (err) {
    if (err instanceof multer.MulterError) {
      //1) A Multer error occurred when uploading.
      return res.status(400).json({ status: "fail", message: err });
    } else if (err) {
      //2) An unknown error occurred when uploading.
      return res
        .status(500)
        .json({
          status: "fail",
          message: "An unknown error occurred when uploading.",
        });
    }
    //3) Every Thing is fine
    next();
  });
}

module.exports = { uploadImg };

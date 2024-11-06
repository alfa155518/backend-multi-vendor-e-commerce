const express = require("express");

const router = express.Router();
const {
  createVendor,
  allVendor,
  logoutVendor,
} = require("../controllers/vendors");
const { uploadImg } = require("../middlewares/uploadPhoto");
const authenticateUser = require("../middlewares/authenticateUser");
const checkConfiguration = require("../middlewares/checkConfiguration");

router.post(
  "/",
  authenticateUser,
  checkConfiguration,
  uploadImg("storeLogo"),
  createVendor
);

router.get("/", authenticateUser, allVendor);

router.delete("/", authenticateUser, logoutVendor);

// Error handling middleware
router.use((err, req, res, next) => {
  console.error(err.stack);
  res
    .status(500)
    .json({ error: "Internal Server Error", message: err.message });
});

module.exports = router;

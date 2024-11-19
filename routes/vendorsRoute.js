const express = require("express");
const router = express.Router();
const {
  createVendor,
  allVendor,
  logoutVendor,
  getVendorById,
} = require("../controllers/vendors");
const { uploadImg } = require("../middlewares/uploadPhoto");
const authenticateUser = require("../middlewares/authenticateUser");
const checkConfiguration = require("../middlewares/checkConfiguration");
const isValidId = require("../middlewares/isValidId");

router.post(
  "/",
  authenticateUser,
  checkConfiguration,
  uploadImg("storeLogo"),
  createVendor
);
router.get("/", allVendor);
router.delete("/", authenticateUser, logoutVendor);
router.get("/:id", isValidId, getVendorById);

// Error handling middleware
router.use((err, req, res, next) => {
  console.error("Error occurred:", err.message); // Log only the message, not the stack
  if (err.isOperational) {
    return res.status(err.statusCode || 500).json({
      error: err.name,
      message: err.message,
    });
  }
  res.status(500).json({ error: "Internal Server Error" });
});

module.exports = router;

const express = require("express");
const router = express.Router();
const isValidId = require("../middlewares/isValidId");
const { uploadImg } = require("../middlewares/uploadPhoto");
const { loginUser, logout } = require("../controllers/auth");
const {
  addUser,
  getAllUser,
  getUserById,
  deleteUser,
} = require("../controllers/users");
// Sign up route with image upload
// const authenticateUser = require("../middlewares/authenticateUser"); // Middleware for authentication

// Login route
router.post("/login", loginUser);
router.post("/signup", uploadImg, addUser);

// Grouping protected routes to reduce repetitive middleware calls
router.get("/", getAllUser);
// router.get("/:id", authenticateUser, isValidId, getUserById);
// router.delete("/:id", authenticateUser, isValidId, deleteUser);
// router.delete("/logout/:id", authenticateUser, isValidId, logout);

// Error handling middleware
router.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send("Something broke!");
});

module.exports = router;

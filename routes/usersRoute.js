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
const authenticateUser = require("../middlewares/authenticateUser"); // Middleware for authentication

// Sign up route with image upload
router.post("/signup", uploadImg, addUser);

// Login route
router.post("/login", loginUser);

// Grouping protected routes to reduce repetitive middleware calls
router.use(authenticateUser);
router.get("/", getAllUser);
router.get("/:id", isValidId, getUserById);
router.delete("/:id", isValidId, deleteUser);
router.delete("/logout/:id", isValidId, logout);

// Error handling middleware
router.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send("Something broke!");
});

module.exports = router;

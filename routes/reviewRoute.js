const express = require("express");
const router = express.Router();
const isValidId = require("../middlewares/isValidId");
const {
  postReview,
  getReviews,
  likeAction,
  disLikeAction,
} = require("../controllers/reviews");
const authenticateUser = require("../middlewares/authenticateUser");

// Middleware order adjusted
router.post("/", authenticateUser, postReview);
router.patch("/like/:id", isValidId, authenticateUser, likeAction);
router.patch("/dislike/:id", isValidId, authenticateUser, disLikeAction);
router.get("/", getReviews);

// Error handling middleware - example implementation
router.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send("Something broke!");
});

module.exports = router;

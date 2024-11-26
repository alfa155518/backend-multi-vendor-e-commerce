const mongoose = require("mongoose");

const reviewsSchema = new mongoose.Schema({
  reviewer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true,
  },
  rating: {
    type: Number,
    default: 1,
    min: 1,
    max: 5,
  },
  message: {
    type: String,
    required: [true, "you must Write A Message"],
  },
  fans: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  ],
  like: {
    type: Number,
    default: 0,
  },
  dislike: {
    type: Number,
    default: 0,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Review = mongoose.model("Review", reviewsSchema);

module.exports = Review;

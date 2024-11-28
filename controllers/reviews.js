const jwt = require("jsonwebtoken");
const Reviews = require("../models/reviewsModel");
const Vendor = require("../models/vendorsModel");
const Product = require("../models/productsModel");
const checkToken = require("../helpers/checkToken");
const ErrorsHandler = require("../controllers/error");
const User = require("../models/usersModel");

// add Review
const postReview = async (req, res) => {
  try {
    // Verify token and extract user ID
    const decoded = await checkToken(req, res);
    const { id } = jwt.verify(decoded, process.env.JWT_SECRET_KEY);

    // Create a new review
    const review = await Reviews.create({ ...req.body, reviewer: id });

    // Add review to the product's reviews array
    const product = await Product.findByIdAndUpdate(
      req.body.product,
      { $push: { reviews: review._id } },
      { new: true }
    );

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Retrieve the vendor associated with the product
    const vendor = await Vendor.findById(product.vendor[0]);
    if (!vendor) {
      return res.status(404).json({ message: "Vendor not found" });
    }

    // Update Vendor Reviews Number
    const updatedVendor = await Vendor.findByIdAndUpdate(
      vendor._id,
      { $inc: { "performanceMetrics.reviews": 1 } },
      { new: true }
    );

    if (!updatedVendor) {
      return res.status(404).json({ message: "Vendor update failed" });
    }

    // Send success response
    res.status(200).json({
      message: "Review added successfully",
      review,
    });
  } catch (error) {
    console.error("Error posting review:", error);

    // Handle errors
    if (error.name === "ValidationError") {
      return ErrorsHandler.validationErrors(res, error, 422, "fail");
    } else {
      return ErrorsHandler.globalError(res, error);
    }
  }
};

// All Reviews
const getReviews = async (_, res) => {
  try {
    // Get All Reviews And populate User data in single Review
    const reviews = await Reviews.find()
      .populate({
        path: "reviewer",
        select: "name photo",
      })
      .select("-__v");

    res.status(200).json({
      message: "All Reviews fetched successfully",
      reviews,
      length: reviews.length,
    });
  } catch (error) {
    return ErrorsHandler.globalError(res, error);
  }
};

// Like User Action
const likeAction = async (req, res) => {
  try {
    const decoded = await checkToken(req, res);

    const { id } = jwt.verify(decoded, process.env.JWT_SECRET_KEY);

    // Fetch user and review concurrently
    const [user, review] = await Promise.all([
      User.findById(id),
      Reviews.findById(req.params.id),
    ]);

    if (!user) {
      return ErrorsHandler.userNotFound(res);
    }

    if (!review) {
      return res.status(404).json({ message: "Review not found" });
    }

    const admirerAlreadyReacted = review.fans.includes(user._id);

    if (admirerAlreadyReacted) {
      return res
        .status(400)
        .json({ message: "You already Reacted on this review" });
    }

    await Reviews.findByIdAndUpdate(
      review._id,
      {
        $inc: { like: 1 },
        $push: { fans: user._id },
      },
      { new: true }
    );

    res.status(200).json({ message: "Thanks For Your opinion" });
  } catch (error) {
    return ErrorsHandler.globalError(res, error);
  }
};

// DisLike User Action
const disLikeAction = async (req, res) => {
  try {
    const decoded = await checkToken(req, res);

    const { id } = jwt.verify(decoded, process.env.JWT_SECRET_KEY);

    // Fetch user and review concurrently
    const [user, review] = await Promise.all([
      User.findById(id),
      Reviews.findById(req.params.id),
    ]);

    if (!user) {
      return ErrorsHandler.userNotFound(res);
    }

    if (!review) {
      return res.status(404).json({ message: "Review not found" });
    }

    const admirerAlreadyReacted = review.fans.includes(user._id);

    if (admirerAlreadyReacted) {
      return res
        .status(400)
        .json({ message: "You already Reacted on this review" });
    }

    await Reviews.findByIdAndUpdate(
      review._id,
      {
        $inc: { dislike: 1 },
        $push: { fans: user._id },
      },
      { new: true }
    );

    res.status(200).json({ message: "Thanks For Your opinion" });
  } catch (error) {
    return ErrorsHandler.globalError(res, error);
  }
};

module.exports = {
  postReview,
  getReviews,
  likeAction,
  disLikeAction,
};

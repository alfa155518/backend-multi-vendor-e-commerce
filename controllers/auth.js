const User = require("../models/usersModel");
const ErrorHandler = require("../controllers/error");
const jwt = require("jsonwebtoken");
const checkToken = require("../helpers/checkToken");
const { cloudinaryRemoveImage } = require("../helpers/cloudinary");
const loginUser = async (req, res) => {
  try {
    const { email, password } = await req.body;

    // Input validation
    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and password are required." });
    }
    // 1) Check if email exists
    const existingUser = await User.findOne({ email });
    if (!existingUser) {
      return ErrorHandler.userNotFound(res);
    }

    // 2) Check Password is Correct
    const isPasswordCorrect = await existingUser.comparePassword(password);
    if (!isPasswordCorrect) {
      return res.status(401).json({ message: "Password Not Correct" });
    }

    // 3) Generate JWT Token
    const token = jwt.sign(
      {
        id: existingUser._id,
        email,
      },
      process.env.JWT_SECRET_KEY,
      {
        expiresIn: process.env.JWT_EXPIRES_IN,
      }
    );

    res.status(200).json({
      message: "Login successful",
      user: existingUser,
      token,
    });
  } catch (error) {
    console.error("Login error:", error); // Log the error for debugging
    return ErrorHandler.globalError(res, error);
  }
};

const logout = async (req, res) => {
  try {
    const token = await checkToken(req, res);

    const decoded = await jwt.verify(token, process.env.JWT_SECRET_KEY);

    // Check if the decoded token has an id
    if (!decoded || !decoded.id) {
      return res.status(401).json({ message: "Unauthorized: Invalid token" });
    }

    // Directly attempt to delete the user
    const deletedUser = await User.findByIdAndDelete(decoded.id);

    // Remove img from cloudarny
    await cloudinaryRemoveImage(deletedUser.photo.publicId);

    if (!deletedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ message: "Logout successful" });
  } catch (error) {
    if (error.name === "JsonWebTokenError" || "TokenExpiredError") {
      return ErrorHandler.validToken(res, error);
    }
    return ErrorHandler.globalError(res, error);
  }
};

module.exports = {
  loginUser,
  logout,
};

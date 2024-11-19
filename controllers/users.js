const fs = require("fs");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const User = require("../models/usersModel");
const path = require("path");
const ErrorsHandler = require("./error");
const checkToken = require("../helpers/checkToken");
const {
  cloudinaryUploadImage,
  cloudinaryRemoveImage,
} = require("../helpers/cloudinary");

const addUser = async (req, res) => {
  try {
    const { email } = await req.body;

    const existingUser = await User.findOne({ email });

    // 1) Check if user already exists
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    // 2) Create new user in the database
    const user = await User.create(req.body);

    // 3) Upload to Cloudinary
    const imagePath = await path.join(
      __dirname,
      `../uploads/${req?.file?.filename}`
    );
    const result = await cloudinaryUploadImage(imagePath, "users");

    // 4) Delete Old Profile photo if exit
    if (user.photo.publicId !== null) {
      await cloudinaryRemoveImage(user.photo.publicId);
    }
    // 5) Change the ProfilePhoto in The DB
    user.photo = {
      url: result.secure_url,
      publicId: result.public_id,
    };
    await user.hashPassword(user.password);
    // 6) Save User
    await user.save();

    res.status(201).json({ message: "User created successfully" });

    // 9) Remove Img From Images Folder
    if (imagePath) {
      fs?.unlinkSync(imagePath);
    }
  } catch (error) {
    const imagePath = await path.join(
      __dirname,
      `../uploads/${req?.file?.filename}`
    );
    if (imagePath && error) {
      if (imagePath) {
        fs?.unlinkSync(imagePath);
      }
    }
    if (error.name === "ValidationError") {
      return ErrorsHandler.validationErrors(res, error, 422, "fail");
    } else {
      return ErrorsHandler.globalError(res, error);
    }
  }
};

const getAllUser = async (_, res) => {
  try {
    const allUser = await User.find().select("name email role photo");
    if (!allUser || allUser.length === 0) {
      return res.status(404).json({ message: "No users found" });
    }
    res.status(200).json({
      message: "All users fetched successfully",
      length: allUser.length,
      users: allUser,
    });
  } catch (error) {
    console.error(error);
    return ErrorsHandler.globalError(res, error);
  }
};

const getUserById = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id).select("-__v");
    if (!user) {
      return ErrorsHandler.userNotFound(res);
    }

    res.status(200).json({ message: "User fetched successfully", user });
  } catch (error) {
    console.error(error);
    return ErrorsHandler.globalError(res, error);
  }
};

const deleteUser = async (req, res) => {
  try {
    await checkToken(req, res);
    const { id } = req.params;

    const user = await User.findByIdAndDelete(id);
    if (!user) {
      if (!res.headersSent) {
        return ErrorsHandler.userNotFound(res);
      }
    }

    res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    if (error.name === "JsonWebTokenError" || "TokenExpiredError") {
      return ErrorsHandler.validToken(res, error);
    }
    return ErrorsHandler.globalError(res, error);
  }
};

const updateDetails = async (req, res) => {
  try {
    const token = await checkToken(req, res);
    const { id } = jwt.verify(token, process.env.JWT_SECRET_KEY);
    const imagePath = path.join(__dirname, `../uploads/${req?.file?.filename}`);
    const result = await cloudinaryUploadImage(imagePath, "users");
    const user = await User.findByIdAndUpdate(id, req.body, { new: true });

    if (!user) {
      return ErrorsHandler.userNotFound(res);
    }

    if (user.photo.publicId !== null) {
      await cloudinaryRemoveImage(user.photo.publicId);
    }

    user.photo = {
      url: result.secure_url,
      publicId: result.public_id,
    };

    user.save();
    res.status(200).json({ message: "User updated successfully", user });

    if (imagePath) {
      fs?.unlinkSync(imagePath);
    }
  } catch (error) {
    const imagePath = await path.join(
      __dirname,
      `../uploads/${req?.file?.filename}`
    );
    if (imagePath || error) {
      if (imagePath) {
        fs?.unlinkSync(imagePath);
      }
    }
    if (error.name === "ValidationError") {
      return ErrorsHandler.validationErrors(res, error, 422, "fail");
    } else {
      return ErrorsHandler.globalError(res, error);
    }
  }
};

const updatePassword = async (req, res) => {
  try {
    const token = await checkToken(req, res);
    const { currentPassword, newPassword, confirmPassword } = await req.body;
    // Verify token and retrieve user
    const { id } = jwt.verify(token, process.env.JWT_SECRET_KEY);
    const user = await User.findById(id).select("+password");

    if (!user) {
      return ErrorsHandler.userNotFound(res);
    }

    // Check if the current password matches
    const isCurrentPasswordCorrect = await bcrypt.compare(
      currentPassword,
      user.password
    );
    if (!isCurrentPasswordCorrect) {
      return res.status(401).json({ message: "Current password is incorrect" });
    }

    // Check if new password matches confirm password
    if (newPassword !== confirmPassword) {
      return res
        .status(400)
        .json({ message: "New password does not match confirmed password" });
    }

    // Ensure the new password meets the length requirement
    if (newPassword.length < 8) {
      return res
        .status(400)
        .json({ message: "New password must be at least 8 characters long" });
    }

    // Hash the new password
    user.password = await bcrypt.hash(newPassword, 12);

    // Attempt to save the user
    await user.save();

    res.status(200).json({
      message: "Password updated successfully",
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: "Another User Use This Email" });
    }
    if (error.name === "ValidationError") {
      return ErrorsHandler.validationErrors(res, error, 422, "fail");
    } else {
      return ErrorsHandler.globalError(res, error);
    }
  }
};

module.exports = {
  addUser,
  getAllUser,
  getUserById,
  deleteUser,
  updateDetails,
  updatePassword,
};

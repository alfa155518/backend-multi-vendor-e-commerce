const User = require("../models/usersModel");
const path = require("path");
const fs = require("fs");
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

    // 2) Check if image already exists
    if (!req.file) {
      return res.status(400).send({
        status: "error",
        message: "upload an image",
      });
    }

    // 3) Create new user in the database
    const user = await User.create(req.body);

    if (!process.env.JWT_SECRET_KEY || !process.env.JWT_EXPIRES_IN) {
      return res.status(500).json({ message: "Server configuration error" });
    }

    // 4) Upload to Cloudinary
    const imagePath = await path.join(
      __dirname,
      `../uploads/${req?.file?.filename}`
    );
    const result = await cloudinaryUploadImage(imagePath);

    // 5) Delete Old Profile photo if exit
    if (user.photo.publicId !== null) {
      await cloudinaryRemoveImage(user.photo.publicId);
    }
    // 6) Change the ProfilePhoto in The DB
    user.photo = {
      url: result.secure_url,
      publicId: result.public_id,
    };
    // 7) Save User
    await user.save();

    res.status(201).json({ message: "User created successfully" });

    // 8) Remove Img From Images Folder
    if (imagePath) {
      fs?.unlinkSync(imagePath);
    }
  } catch (error) {
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

module.exports = {
  addUser,
  getAllUser,
  getUserById,
  deleteUser,
};

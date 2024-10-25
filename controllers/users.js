const User = require("../models/usersModel");
const ErrorsHandler = require("./error");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const addUser = async (req, res) => {
  try {
    const { name, email, password } = await req.body;

    const existingUser = await User.findOne({ email });

    // 1) Check if user already exists
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    // 2) Create new user in the database
    const user = await User.create(req.body);

    // 3) Generate JWT Token
    const token = jwt.sign(
      {
        id: user._id,
        email,
      },
      process.env.JWT_SECRET_KEY,
      {
        expiresIn: process.env.JWT_EXPIRES_IN,
      }
    );

    res.status(201).json({
      message: "User created successfully",
      user,
      token,
    });
  } catch (error) {
    if (error.name === "ValidationError") {
      return ErrorsHandler.validationErrors(res, error, 422, "fail");
    } else {
      new ErrorsHandler.globalError(res, error);
    }
  }
};

const getAllUser = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query; // Default to page 1 and limit 10
    const skip = (page - 1) * limit; // Calculate the number of records to skip

    const allUser = await User.find().select("-__v").skip(skip).limit(limit); // Apply pagination

    if (allUser.length <= 0) {
      return res.status(404).json({ message: "No users found" });
    }

    const totalUsers = await User.countDocuments(); // Get total user count for pagination info

    res.status(200).json({
      message: "All users fetched successfully",
      length: allUser.length,
      total: totalUsers,
      page: Number(page),
      totalPages: Math.ceil(totalUsers / limit), // Calculate total pages
      allUser,
    });
  } catch (error) {
    new ErrorsHandler.globalError(res, error);
  }
};

const getUserById = async (req, res) => {
  try {
    const { id } = await req.params;
    console.log(id);
  } catch (error) {
    new ErrorsHandler.globalError(res, error);
  }
};

module.exports = {
  addUser,
  getAllUser,
  getUserById,
};

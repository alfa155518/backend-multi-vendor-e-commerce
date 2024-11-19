const fs = require("fs");
const path = require("path");
const jwt = require("jsonwebtoken");
const ErrorsHandler = require("../controllers/error");
const checkToken = require("../helpers/checkToken");
const Vendors = require("../models/vendorsModel");
const {
  cloudinaryUploadImage,
  cloudinaryRemoveImage,
} = require("../helpers/cloudinary");

const createVendor = async (req, res) => {
  try {
    // Securely construct the image path
    const sanitizedFileName = path.basename(req?.file?.filename);
    const imagePath = path.join(__dirname, `../uploads/${sanitizedFileName}`);

    // 1) Create Vendor
    const vendor = await Vendors.create(req.body);

    // 2) Generate JWT Token
    const token = jwt.sign(
      {
        id: vendor._id,
        email: vendor.email,
      },
      process.env.JWT_SECRET_KEY,
      {
        expiresIn: process.env.JWT_EXPIRES_IN,
      }
    );

    const result = await cloudinaryUploadImage(imagePath, "stores");

    if (vendor.storeLogo?.publicId !== null) {
      await cloudinaryRemoveImage(vendor.storeLogo.publicId);
    }

    // 3) Change the ProfilePhoto in The DB
    vendor.storeLogo = {
      url: result.secure_url,
      publicId: result.public_id,
    };

    // 4) Save User
    await vendor.save();

    res.status(201).json({
      message: "vendor created successfully",
      vendor,
      token,
    });

    // 5) Remove Img From Images Folder
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
    }
    if (error.name === "MongoError" || error.code === 11000) {
      return ErrorsHandler.duplicateKeyError(error, res);
    }
    return ErrorsHandler.globalError(res, error);
  }
};

const getVendorById = async (req, res) => {
  try {
    const token = await checkToken(req, res);
    const { id } = jwt.verify(token, process.env.JWT_SECRET_KEY);
    const vendor = await Vendors.findById(id).populate({
      path: "products",
      select: "-__v",
    });
    if (!vendor) {
      return res.status(404).json({ message: "Vendor not found" });
    }
    res.status(200).json({ vendor });
  } catch (error) {
    return ErrorsHandler.globalError(res, error);
  }
};

const allVendor = async (req, res) => {
  try {
    const vendors = await Vendors.find().select("-__v");
    res.status(200).json({
      message: "All Vendors fetched successfully",
      vendors,
      length: vendors.length,
    });
  } catch (error) {
    return ErrorsHandler.globalError(res, error);
  }
};

const logoutVendor = async (req, res) => {
  try {
    const token = await checkToken(req, res);
    const { id } = await jwt.verify(token, process.env.JWT_SECRET_KEY);
    const vendor = await Vendors.findByIdAndDelete(id);

    // Remove img from cloudarny
    await cloudinaryRemoveImage(vendor.storeLogo.publicId);

    if (!vendor) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).send({ message: "Vendor deleted successfully" });
  } catch (error) {
    if (error.name === "JsonWebTokenError" || "TokenExpiredError") {
      return ErrorsHandler.validToken(res, error);
    }
    return ErrorsHandler.globalError(res, error);
  }
};

module.exports = {
  createVendor,
  allVendor,
  logoutVendor,
  getVendorById,
};

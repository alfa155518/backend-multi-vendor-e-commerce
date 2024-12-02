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

// Create Vendor Account
const createVendor = async (req, res) => {
  try {
    // Securely construct the image path
    const sanitizedFileName = path.basename(req?.file?.filename);
    const imagePath = path.join(__dirname, `../uploads/${sanitizedFileName}`);

    if (!req.file) {
      return res.status(400).send({
        status: "error",
        message: "Please upload an image or ensure the body is not empty.",
      });
    }

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

// Get Single Vendor
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

// Get All Vendors
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

// Logout Vendor
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

// Update Vendor details
const updateVendorDetails = async (req, res) => {
  try {
    // Validate request body for required fields
    if (!req.body || Object.keys(req.body).length === 0) {
      return res.status(400).json({ message: "Invalid request data" });
    }

    // Check There is Token
    const token = await checkToken(req, res);
    if (!token) {
      return res.status(401).json({ message: "Unauthorized access" });
    }
    const { id } = jwt.verify(token, process.env.JWT_SECRET_KEY);

    // Update Vendor
    const vendor = await Vendors.findByIdAndUpdate(id, req.body, { new: true });
    if (!vendor) {
      return res.status(404).json({ message: "Vendor not found" });
    }

    res.status(200).json({ message: "Vendor updated successfully", vendor });
  } catch (error) {
    if (error.name === "ValidationError") {
      return ErrorsHandler.validationErrors(res, error, 422, "fail");
    }
    if (error.name === "MongoError" || error.code === 11000) {
      return ErrorsHandler.duplicateKeyError(error, res);
    }
    return ErrorsHandler.globalError(res, error);
  }
};

// Update Store Details
const updateStoreDetails = async (req, res) => {
  try {
    // Validate request body for required fields
    if (!req.body || Object.keys(req.body).length === 0) {
      return res.status(400).json({ message: "Invalid request data" });
    }
    const { storeName, description } = req.body;
    // Check There is Token
    const token = await checkToken(req, res);
    if (!token) {
      return res.status(401).json({ message: "Unauthorized access" });
    }
    const { id } = jwt.verify(token, process.env.JWT_SECRET_KEY);

    // Check Vendor
    const vendor = await Vendors.findById(id);
    console.log(vendor);
    if (!vendor) {
      return res.status(404).json({ message: "Vendor not found" });
    }

    // Update Store Details
    vendor.storeDetails = {
      storeName,
      description,
    };
    vendor.save();

    res.status(200).json({ message: "Store updated successfully", vendor });
  } catch (error) {
    if (error.name === "ValidationError") {
      return ErrorsHandler.validationErrors(res, error, 422, "fail");
    }
    if (error.name === "MongoError" || error.code === 11000) {
      return ErrorsHandler.duplicateKeyError(error, res);
    }
    return ErrorsHandler.globalError(res, error);
  }
};

module.exports = {
  createVendor,
  allVendor,
  logoutVendor,
  getVendorById,
  updateVendorDetails,
  updateStoreDetails,
};

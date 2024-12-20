const { isValidObjectId } = require("mongoose");
const fs = require("fs").promises; // Use promises for async file operations
const jwt = require("jsonwebtoken");
const path = require("path");
const Product = require("../models/productsModel");
const Vendor = require("../models/vendorsModel");
const ErrorsHandler = require("./error");
const checkToken = require("../helpers/checkToken");
const {
  cloudinaryUploadImage,
  cloudinaryRemoveImage,
} = require("../helpers/cloudinary");
const checkIsVendor = require("../helpers/checkIsVendor");

const createProduct = async (req, res) => {
  try {
    const token = await checkToken(req, res);
    const { id } = await jwt.verify(token, process.env.JWT_SECRET_KEY);
    const vendor = await Vendor.findById(id);

    if (!req.file) {
      return res.status(400).send({
        status: "error",
        message: "Please upload an image or ensure the body is not empty.",
      });
    }

    if (!vendor) {
      return res
        .status(404)
        .json({ message: "Vendor not found OR Create Vendor Account" });
    }

    // Sanitize filename and check if file exists
    let imagePath;
    if (req.file) {
      const sanitizedFilename = path.basename(req.file.filename);
      imagePath = path.join(__dirname, `../uploads/${sanitizedFilename}`);
    }

    const newProduct = await Product.create(req.body);

    // Upload Img To Cloudinary only if file exists
    if (req.file) {
      const result = await cloudinaryUploadImage(imagePath, "all products");
      if (newProduct.photo?.publicId) {
        await cloudinaryRemoveImage(newProduct.photo.publicId);
      }
      newProduct.photo = {
        url: result.secure_url,
        publicId: result.public_id,
      };
    }

    // Add the new product ID to the vendor's products array
    await vendor.products.push(newProduct._id);
    // Add the vendor ID to the vendor array
    await newProduct.vendor.push(vendor._id);

    // Use Promise.all for concurrent saves
    await Promise.all([vendor.save(), newProduct.save()]);

    res.status(201).json({
      message: "Product created successfully",
      newProduct,
    });

    // Asynchronously delete the file if it exists
    try {
      if (req.file) {
        await fs.unlink(imagePath);
      }
    } catch (err) {
      console.error("Error deleting file:", err);
    }
  } catch (error) {
    const sanitizedFilename = path.basename(req?.file?.filename);
    const imagePath = path.join(__dirname, `../uploads/${sanitizedFilename}`);

    // Asynchronously delete the file if it exists
    try {
      if (req.file) {
        await fs.unlink(imagePath);
      }
    } catch (err) {
      console.error("Error deleting file during error handling:", err);
    }

    if (error.name === "ValidationError") {
      return ErrorsHandler.validationErrors(res, error, 422, "fail");
    } else {
      return ErrorsHandler.globalError(res, error);
    }
  }
};

const deleteProduct = async (req, res) => {
  try {
    const token = await checkToken(req, res);
    const productId = await req.params.productId;

    // Check is Valid Id
    if (!isValidObjectId(productId)) {
      return res.status(400).json({ message: "Invalid product ID format" });
    }

    const { vendor, productExit } = await checkIsVendor(token, productId, res);
    if (!productExit) {
      return res
        .status(404)
        .json({ message: "Product not found Vendor Products" });
    }

    // Directly filter the products array
    vendor.products = await vendor.products.filter(
      (product) => product.toString() !== productId
    );

    // Save the updated vendor
    await vendor.save();

    // Delete the product
    const deletedProduct = await Product.findByIdAndDelete(productId);

    await cloudinaryRemoveImage(deletedProduct.photo.publicId);

    res.status(200).json({
      message: "Product deleted successfully",
    });
  } catch (error) {
    console.error(error);
    return ErrorsHandler.globalError(res, error);
  }
};

const getProductById = async (req, res) => {
  try {
    const { productId } = await req.params;
    // Check if the productId is a valid ObjectId
    if (!isValidObjectId(productId)) {
      return res.status(400).json({ message: "Invalid product ID format" });
    }

    // Fetching the product from the database
    const product = await Product.findById(productId)
      .populate({
        path: "vendor",
        select: "-__v",
      })
      .select("-__v");

    // Check if the product exists
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Send a successful response
    res.status(200).json({
      message: "Product found successfully",
      product,
    });
  } catch (error) {
    console.error("Error fetching product:", error);
    return ErrorsHandler.globalError(res, error);
  }
};

const getAllProduct = async (req, res) => {
  try {
    const { limit, page } = req.query;

    // Validate and convert limit and page to integers
    const parsedLimit = parseInt(limit, 10);
    const parsedPage = parseInt(page, 10);

    // Check if parsed values are valid
    if (isNaN(parsedLimit) || parsedLimit <= 0) {
      return res.status(400).json({ message: "Invalid limit value" });
    }
    if (isNaN(parsedPage) || parsedPage < 1) {
      return res.status(400).json({ message: "Invalid page value" });
    }

    const skip = (parsedPage - 1) * parsedLimit;
    // Fetch all products from the database with pagination and vendor name included
    const allProducts = await Product.find()
      .limit(parsedLimit)
      .skip(skip)
      .populate({
        path: "vendor",
        select: "name",
      })
      .select("-__v");

    // Check if Products are already Exit
    if (!allProducts || allProducts.length === 0) {
      return res.status(404).json({ message: "No products found" });
    }

    res.status(200).json({
      message: "All products fetched successfully",
      length: allProducts.length,
      products: allProducts,
    });
  } catch (error) {
    console.error("Error fetching products:", error.message);
    return ErrorsHandler.globalError(res, error);
  }
};

const updateProduct = async (req, res) => {
  try {
    const { productId } = await req.params;

    const { name, description, price, stock } = await req.body;

    // Parse `photo` if it is a JSON string
    if (typeof req.body.photo === "string") {
      req.body.photo = JSON.parse(req.body.photo);
    }

    // Check is Valid Id
    if (!isValidObjectId(productId)) {
      return res.status(400).json({ message: "Invalid product ID format" });
    }
    const decoded = await checkToken(req, res);

    const { id } = await jwt.verify(decoded, process.env.JWT_SECRET_KEY);

    const vendor = await Vendor.findById(id);

    if (!vendor) {
      return res
        .status(404)
        .json({ message: "Vendor not found OR Create Vendor Account" });
    }

    // Check Product id is exit in vendor products
    const productExists = await Product.exists({ _id: productId, vendor: id });
    if (!productExists) {
      return res
        .status(404)
        .json({ message: "Product not found in your products" });
    }
    if (!req.file) {
      if (!req.body.photo) {
        return res.status(400).send({
          status: "error",
          message: "Please upload an image or ensure the body is not empty.",
        });
      }
    }

    // Sanitize filename and check if file exists
    let imagePath;
    if (req.file) {
      const sanitizedFilename = path.basename(req.file.filename);
      imagePath = path.join(__dirname, `../uploads/${sanitizedFilename}`);
    }

    // Update the product
    const updatedProduct = await Product.findByIdAndUpdate(
      productId,
      {
        name,
        description,
        price,
        stock,
        photo: req.body.photo, // Ensure `photo` is an object with `url` and `publicId`
      },
      { new: true }
    );

    if (!updatedProduct) {
      return res.status(404).json({ message: "Product update failed" });
    }

    // Upload Img To Cloudinary only if file exists
    if (req.file) {
      const result = await cloudinaryUploadImage(imagePath, "all products");
      if (updatedProduct.photo?.publicId) {
        await cloudinaryRemoveImage(updatedProduct.photo.publicId);
      }
      updatedProduct.photo = {
        url: result.secure_url,
        publicId: result.public_id,
      };
    }

    // Save the updated product
    await updatedProduct.save();

    res.status(200).json({
      message: "Product updated successfully",
      updatedProduct,
    });

    // Asynchronously delete the file if it exists
    try {
      if (req.file) {
        await fs.unlink(imagePath);
      }
    } catch (err) {
      console.error("Error deleting file:", err);
    }
  } catch (error) {
    const sanitizedFilename = path.basename(req?.file?.filename);
    const imagePath = path.join(__dirname, `../uploads/${sanitizedFilename}`);

    // Asynchronously delete the file if it exists
    try {
      if (req.file) {
        await fs.unlink(imagePath);
      }
    } catch (err) {
      console.error("Error deleting file during error handling:", err);
    }

    if (error.name === "ValidationError") {
      return ErrorsHandler.validationErrors(res, error, 422, "fail");
    } else {
      return ErrorsHandler.globalError(res, error);
    }
  }
};

module.exports = {
  createProduct,
  deleteProduct,
  getProductById,
  getAllProduct,
  updateProduct,
};

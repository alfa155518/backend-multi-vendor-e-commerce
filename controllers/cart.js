const jwt = require("jsonwebtoken");
const User = require("../models/usersModel");
const checkToken = require("../helpers/checkToken");
const ErrorHandler = require("../controllers/error");
const Products = require("../models/productsModel");

// Add Product To Cart
const addToCart = async (req, res) => {
  try {
    const { id } = req.params; // Removed unnecessary await
    const token = await checkToken(req, res);
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);

    // Check User Already Exists
    const user = await User.findById(decoded.id);
    if (!user) {
      return ErrorHandler.userNotFound(res);
    }

    // Check Product Already Exists
    const product = await Products.findById(id);
    if (!product) {
      return ErrorHandler.productNotFound(res);
    }

    // Check if the product is already in the cart
    if (user.cart.some((item) => item.productId.toString() === id)) {
      return res.status(400).json({ message: "Product already in cart" });
    }

    user.cart.push({
      productId: id,
    });

    await user.save();

    res.status(200).json({ message: "Product added to cart successfully" });
  } catch (error) {
    console.error(error);
    // Handle specific JWT errors
    if (
      error.name === "JsonWebTokenError" ||
      error.name === "TokenExpiredError"
    ) {
      return ErrorHandler.validToken(res, error);
    }

    // Handle database errors
    if (error.name === "MongoError") {
      return res.status(500).json({ message: "Database error occurred" });
    }

    // Generic error response
    return res.status(500).json({ message: "Internal server error" });
  }
};

// Show All Products In Shopping Cart
const showProductInCart = async (req, res) => {
  try {
    const token = await checkToken(req, res);
    const { id } = jwt.verify(token, process.env.JWT_SECRET_KEY);

    // Validate user ID
    if (!id) {
      return res.status(400).json({ message: "Invalid token" });
    }

    // Find user and populate cart with product details
    const user = await User.findById(id)
      .populate({
        path: "cart.productId", // Populate the productId in the cart
        select: "name price description photo",
        populate: {
          path: "vendor", // Populate vendor details
          select: "name", // Select vendor's name
        },
      })
      .select("name email cart"); // Only select necessary user fields

    if (!user) {
      return ErrorHandler.userNotFound(res);
    }

    // Structure the cart with product details and quantities
    const products = user.cart.map((item) => ({
      product: item.productId, // Populated product details
      quantity: item.quantity, // Quantity of the product
    }));

    res.status(200).json({
      message: "All products in cart fetched successfully",
      length: products.length,
      products,
    });
  } catch (error) {
    console.error(error);

    if (
      error.name === "JsonWebTokenError" ||
      error.name === "TokenExpiredError"
    ) {
      return ErrorHandler.validToken(res, error);
    }

    return res.status(500).json({ message: "Internal server error" });
  }
};

// Remove Product From cart
const removeProductFromCart = async (req, res) => {
  try {
    const { id: productId } = req.params;
    const token = await checkToken(req, res);
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);

    // Find the user by decoded ID
    const user = await User.findById(decoded.id);
    if (!user) {
      return ErrorHandler.userNotFound(res);
    }

    // Check if the product exists in the cart
    const productIndex = user.cart.findIndex(
      (item) => item.productId.toString() === productId
    );
    if (productIndex === -1) {
      return ErrorHandler.productNotFound(res);
    }

    // Remove the product from the cart
    user.cart.splice(productIndex, 1);
    await user.save();

    res.status(200).json({ message: "Product removed from cart successfully" });
  } catch (error) {
    console.error(error);

    if (
      error.name === "JsonWebTokenError" ||
      error.name === "TokenExpiredError"
    ) {
      return res.status(401).json({ message: "Invalid or expired token" });
    }

    return res.status(500).json({ message: "Internal server error" });
  }
};

// Update Quantity Of Product
const updateProductQuantityInCart = async (req, res) => {
  try {
    const { id } = req.params; // Product ID to update
    const { quantity } = req.body; // New quantity
    const token = await checkToken(req, res);
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);

    // Find the user by decoded ID
    const user = await User.findById(decoded.id);
    if (!user) {
      return ErrorHandler.userNotFound(res);
    }

    // Check if the product exists in the cart
    const productIndex = user.cart.findIndex(
      (item) => item.productId.toString() === id
    );
    if (productIndex === -1) {
      return ErrorHandler.productNotFound(res);
    }



    // Update the quantity of the product in the cart
    user.cart[productIndex].quantity = quantity;
    await user.save();

    res.status(200).json({
      message: "Product quantity updated in cart successfully",
      quantity,
    });
  } catch (error) {
    console.error(error);

    if (
      error.name === "JsonWebTokenError" ||
      error.name === "TokenExpiredError"
    ) {
      return res.status(401).json({ message: "Invalid or expired token" });
    }

    return res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = {
  addToCart,
  showProductInCart,
  removeProductFromCart,
  updateProductQuantityInCart,
};

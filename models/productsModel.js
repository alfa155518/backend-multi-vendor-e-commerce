const mongoose = require("mongoose");

// Function to sanitize input
const sanitizeInput = (input) => {
  return input.replace(/<[^>]*>/g, ""); // Simple HTML tag removal
};

const productsSchema = mongoose.Schema({
  name: {
    type: String,
    required: [true, "Product name is required"],
    trim: true,
    set: sanitizeInput,
  },
  description: {
    type: String,
    required: [true, "Product description is required"],
    maxLength: [200, "Description must be between 50 and 200 word"],
    // minLength: [50, "Description must be between 50 and 200 word"],
    trim: true,
    set: sanitizeInput,
  },
  price: {
    type: Number,
    required: [true, "Product price is required"],
    min: 0,
  },
  category: {
    type: String,
    required: [true, "Product category is required"],
    trim: true,
    set: sanitizeInput,
  },
  photo: {
    type: Object,
    default: {
      url: "https://res.cloudinary.com/duumkzqwx/image/upload/f_auto,q_auto/v1/multi-vendor%20E-commerce/all%20products/lvuflf7oj1q4jpiahxou",
      publicId: null,
    },
  },
  stock: {
    type: Number,
    required: [true, "Product stock is required"],
    min: 0,
    default: 5,
  },
  sales: {
    type: Number,
    default: 0,
    min: 0,
  },
  reviews: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Review",
    },
  ],
  vendor: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Vendor",
    },
  ],
  rating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5,
  },
  createdAt: {
    type: Date,
    default: Date.now(),
  },
});

const Products = mongoose.model("Product", productsSchema);
module.exports = Products;

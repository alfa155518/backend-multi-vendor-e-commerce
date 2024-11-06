const mongoose = require("mongoose");
const validator = require("validator");

const vendorSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Please enter the vendor name"],
    trim: true,
  },
  email: {
    type: String,
    required: [true, "Please enter the vendor email"],
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, "Please enter a valid email address"],
  },
  phone: {
    type: String,
    required: [true, "Please enter the vendor phone number"],
    trim: true,
    validate: [
      {
        validator: function (value) {
          return validator.isMobilePhone(value, "any");
        },
        message: "Please enter a valid phone number",
      },
    ],
  },
  country: {
    type: String,
    required: [true, "Please enter the vendor's country"],
    trim: true,
  },
  storeLogo: {
    type: Object,
    default: {
      url: "https://res.cloudinary.com/duumkzqwx/image/upload/f_auto,q_auto/v1/multi-vendor%20E-commerce/vendors/default_vendor_photo",
      publicId: null,
    },
  },
  storeBanner: {
    type: Object,
    default: {
      url: "https://res.cloudinary.com/duumkzqwx/image/upload/f_auto,q_auto/v1/multi-vendor%20E-commerce/vendors/default_vendor_photo",
      publicId: null,
    },
  },
  products: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
    },
  ],
  storeDetails: {
    type: Object,
    storeName: {
      type: String,
      required: [true, "Please enter the store name"],
      trim: true,
    },
    description: {
      type: String,
      required: [true, "Please enter the store description"],
      trim: true,
      maxLength: 300,
    },
  },
  performanceMetrics: {
    totalOrders: {
      type: Number,
      default: 0,
    },
    totalSales: {
      type: Number,
      default: 0,
    },
    averageRating: {
      type: Number,
      default: 0,
    },
    reviews: {
      type: Number,
      default: 0,
    },
  },
});

const AllVendors = mongoose.model("Vendor", vendorSchema);
module.exports = AllVendors;

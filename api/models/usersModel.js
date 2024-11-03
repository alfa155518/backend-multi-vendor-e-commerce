const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");

const userSchema = mongoose.Schema({
  name: {
    type: String,
    required: [true, "Please enter your name"],
    maxLength: [50, "Name cannot exceed 50 characters"],
    trim: true,
  },
  email: {
    type: String,
    required: [true, "Please enter your email"],
    unique: true,
    validate: {
      validator: function (value) {
        return validator.isEmail(value); // Allow any valid email
      },
      message: "Please enter a valid email address",
    },
    trim: true,
  },
  password: {
    type: String,
    required: [true, "Please enter your password"],
    minLength: [8, "You must enter at least 8 characters"],
    trim: true,
  },
  photo: {
    type: Object,
    default: {
      url: "https://res.cloudinary.com/duumkzqwx/image/upload/v1728893153/multi-vendor%20E-commerce/users/default_cuu653.webp",
      publicId: null,
    },
  },
  role: {
    type: String,
    enum: ["user", "admin", "vendor"],
    default: "user",
    trim: true,
  },
});

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  try {
    this.password = await bcrypt.hash(this.password, 12); // Consider increasing rounds if necessary
    next();
  } catch (error) {
    next(error); // Handle error properly
  }
});

userSchema.methods.comparePassword = async function (candidatePassword) {
  try {
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    throw new Error("Password comparison failed");
  }
};

const User = mongoose.model("User", userSchema);
module.exports = User;

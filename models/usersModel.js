const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");
const userSchema = mongoose.Schema({
  name: {
    type: String,
    required: [true, "enter your name"],
    maxLength: [50, "Name cannot exceed 50 characters"],
    trim: true,
  },
  email: {
    type: String,
    required: [true, "enter your email"],
    unique: true,
    validate: {
      validator: function (value) {
        // Custom email validation logic
        return validator.isEmail(value) && value.endsWith("@gmail.com"); // Example domain check
      },
      message: "enter a valid email from the allowed domain @gmail.com",
    },
  },
  password: {
    type: String,
    required: [true, "enter your password"],
    minLength: [8, "You must enter at least 8 characters"],
  },
  photo: {
    type: Object,
    default: {
      url: "https://res.cloudinary.com/duumkzqwx/image/upload/v1728893153/multi-vendor%20E-commerce/users/default_cuu653.webp",
      publicId: null,
    },
    required: [true, "Select a photo"],
  },
  role: {
    type: String,
    enum: ["user", "admin", "vendor"],
    default: "user",
  },
});

userSchema.pre("save", async function (next) {
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

const User = mongoose.model("User", userSchema);

module.exports = User;

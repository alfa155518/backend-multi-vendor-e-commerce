const mongoose = require("mongoose");
const validator = require("validator");

const contactSchema = mongoose.Schema({
  name: {
    type: String,
    required: [true, "Please enter your name"],
    trim: true,
    maxLength: 50,
  },
  email: {
    type: String,
    required: [true, "Please enter your email"],
    trim: true,
    maxLength: 100,
    validate: {
      validator: validator.isEmail,
      message: "Please enter a valid email address",
    },
  },
  phone: {
    type: String,
    trim: true,
    maxLength: 20,
    validate: {
      validator: (value) => validator.isMobilePhone(value, "any"),
      message: "Please enter a valid phone number",
    },
  },
  subject: {
    type: String,
    required: [true, "Please enter the subject"],
    trim: true,
    maxLength: 100,
    lowercase: true,
  },
  message: {
    type: String,
    required: [true, "Please enter your message"],
    trim: true,
    maxLength: 200,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Contact = mongoose.model("Contact", contactSchema);
module.exports = Contact;

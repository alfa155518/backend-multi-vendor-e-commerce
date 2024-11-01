const jwt = require("jsonwebtoken");
const Contact = require("../models/contactModel");
const ErrorsHandler = require("../controllers/error");
const checkToken = require("../helpers/checkToken");
const userMessageTimestamps = {};
const TIME_LIMIT = 10 * 60 * 1000;

const addContactMessage = async (req, res) => {
  const token = await checkToken(req, res);

  const { id } = jwt.verify(token, process.env.JWT_SECRET_KEY);

  const currentTime = Date.now();

  // Check if the user has sent a message within the time limit
  if (
    userMessageTimestamps[id] &&
    currentTime - userMessageTimestamps[id] < TIME_LIMIT
  ) {
    return res.status(429).send({
      message: "You can only send messages once every 10 minutes.",
    });
  }

  try {
    const newMessage = await Contact.create(req.body);
    userMessageTimestamps[id] = currentTime;
    res.status(201).send({
      message: "submitted successfully",
      newMessage,
    });
  } catch (error) {
    if (error.name === "ValidationError") {
      return ErrorsHandler.validationErrors(res, error, 422, "fail");
    } else {
      return ErrorsHandler.globalError(res, error);
    }
  }
};

const getContactMessages = async (_, res) => {
  try {
    const allMessages = await Contact.find().select("-__v");
    if (!allMessages || allMessages.length === 0) {
      return res.status(404).json({ message: "No messages found" });
    }
    res.status(200).send({
      message: "All messages fetched successfully",
      length: allMessages.length,
      messages: allMessages,
    });
  } catch (error) {
    return ErrorsHandler.globalError(res, error);
  }
};

const deleteMessage = async (req, res) => {
  try {
    const { id } = req.params;
    const message = await Contact.findByIdAndDelete(id);
    if (!message) {
      return res.status(404).json({ message: "Message not found" });
    }
    res.status(200).send({
      message: "Message Deleted successfully",
    });
  } catch (error) {
    return ErrorsHandler.globalError(res, error);
  }
};

module.exports = { addContactMessage, getContactMessages, deleteMessage };

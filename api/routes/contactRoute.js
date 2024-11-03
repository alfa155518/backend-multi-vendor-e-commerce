const express = require("express");
const router = express.Router();
const isValidId = require("../../middlewares/isValidId");
const authenticateUser = require("../../middlewares/authenticateUser");
const {
  addContactMessage,
  getContactMessages,
  deleteMessage,
} = require("../../controllers/contact");

router.use(authenticateUser);
router.post("/", addContactMessage);
router.get("/", getContactMessages);
router.delete("/:id", isValidId, deleteMessage);

module.exports = router;

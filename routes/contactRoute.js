const express = require("express");
const router = express.Router();
const isValidId = require("../middlewares/isValidId");
const authenticateUser = require("../middlewares/authenticateUser");
const {
  addContactMessage,
  getContactMessages,
  deleteMessage,
} = require("../controllers/contact");

router.use(authenticateUser);
router.post("/", addContactMessage);
router.get("/", getContactMessages);
router.delete("/:id", isValidId, deleteMessage);
// Error handling middleware
router.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send("Something broke!");
});
module.exports = router;

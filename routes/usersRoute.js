const express = require("express");
const router = express.Router();
const { addUser, getAllUser, getUserById } = require("../controllers/users");

router.post("/signup", addUser);
router.get("/", getAllUser);
router.get("/:id", getUserById);

module.exports = router;

const express = require("express");
const router = express.Router();
const authenticateUser = require("../middlewares/authenticateUser");
const { session } = require("../controllers/payment");

router.post("/", authenticateUser, session);

module.exports = router;

const express = require("express");
const router = express.Router();
const isValidId = require("../middlewares/isValidId");
const authenticateUser = require("../middlewares/authenticateUser");
const cart = require("../controllers/cart");

router.post("/:id", isValidId, authenticateUser, cart.addToCart);
router.get("/", authenticateUser, cart.showProductInCart);
router.delete("/:id", isValidId, authenticateUser, cart.removeProductFromCart);
router.patch(
  "/:id",
  isValidId,
  authenticateUser,
  cart.updateProductQuantityInCart
);
module.exports = router;

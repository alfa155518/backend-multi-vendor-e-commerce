const express = require("express");
const router = express.Router();
const authenticateUser = require("../middlewares/authenticateUser");
const { uploadImg } = require("../middlewares/uploadPhoto");
const product = require("../controllers/product");

router.get("/", product.getAllProduct);
router.get("/:productId", product.getProductById);
router.post("/", authenticateUser, uploadImg("photo"), product.createProduct);
router.delete("/:productId", authenticateUser, product.deleteProduct);
router.patch(
  "/:productId",
  authenticateUser,
  uploadImg("photo"),
  product.updateProduct
);
router.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send("Something broke!");
});

module.exports = router;

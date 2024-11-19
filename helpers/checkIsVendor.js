const Vendor = require("../models/vendorsModel");
const jwt = require("jsonwebtoken");
const checkIsVendor = async (token, productId, res) => {
  const { id } = jwt.verify(token, process.env.JWT_SECRET_KEY);
  const vendor = await Vendor.findById(id);
  if (!vendor) {
    return res
      .status(404)
      .json({ message: "Vendor not found. Please log in again." });
  }

  const productExit = vendor.products.find(
    (product) => product.toString() === productId
  );

  if (!productExit) {
    return productExit;
  } else {
    return { vendor, productExit };
  }
};

module.exports = checkIsVendor;

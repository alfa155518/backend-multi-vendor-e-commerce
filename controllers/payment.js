const stripe = require("stripe")(process.env.SECRET_STRIPE_KEY);
const Product = require("../models/productsModel");
const jwt = require("jsonwebtoken");
const User = require("../models/usersModel");
const checkToken = require("../helpers/checkToken");
const ErrorHandler = require("./error");

const session = async (req, res) => {
  try {
    // Validate token and fetch user ID
    const token = await checkToken(req, res);
    const { id } = jwt.verify(token, process.env.JWT_SECRET_KEY);

    // Fetch user data
    const user = await User.findById(id);
    if (!user) {
      return ErrorHandler.userNotFound(res);
    }

    // Extract product IDs from the user's cart
    const productIds = user.cart.map((item) => item.productId);

    // Fetch product details from the database
    const products = await Product.find({ _id: { $in: productIds } });

    // Check if all products exist in the database
    if (products.length !== user.cart.length) {
      return res.status(404).json({ error: "One or more products not found" });
    }

    // Create line items for Stripe session
    const lineItems = products
      .map((product) => {
        const item = user.cart.find(
          (i) => i.productId.toString() === product._id.toString() // Ensure proper comparison
        );
        if (!item) return null; // Safety check, should not happen

        const priceInCents = Math.round(product.price * 100); // Ensure integer values

        return {
          price_data: {
            currency: "usd",
            product_data: {
              name: product.name,
            },
            unit_amount: priceInCents, // Use rounded integer
          },
          quantity: item.quantity,
        };
      })
      .filter((item) => item); // Filter out null values just in case

    // Create Stripe checkout session
    const sessionData = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: lineItems,
      success_url: `${process.env.APP_URL}/payment/success`,
      cancel_url: `${process.env.APP_URL}/payment/fail`,
    });

    if (sessionData) {
      user.cart = [];
      await user.save();
    }
    res.status(200).json({ url: sessionData.url });
  } catch (error) {
    console.error("Stripe Session Error:", error.message);
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  session,
};

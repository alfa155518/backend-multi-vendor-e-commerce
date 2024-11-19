const mongoose = require("mongoose");
const express = require("express");
const app = express();
const cors = require("cors");
const rateLimit = require("express-rate-limit");
const userRoute = require("./routes/usersRoute");
const contactRoute = require("./routes/contactRoute");
const vendorRoute = require("./routes/vendorsRoute");
const productRoute = require("./routes/productRoute");
// const bodyParser = require("body-parser");
require("dotenv").config();

// Increase payload size limit
// app.use(bodyParser.json({ limit: "10mb" })); // Adjust the size as per your requirement
// app.use(bodyParser.urlencoded({ limit: "10mb", extended: true }));

app.use(express.json());

app.use(
  //
  cors({
    origin: "*", // Update this line to allow your specific frontend origin
    methods: ["GET", "POST", "PATCH", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
// Connect To Database with error handling
mongoose
  .connect(process.env.DATABASE_URL)
  .then(() => {
    console.log("Database Connected");
  })
  .catch((err) => {
    console.error("Database connection error");
    process.exit(1); // Exit the process if the connection fails
  });

// User Routes
app.use("/api/v1/users", userRoute);

// Contact Routes
app.use("/api/v1/contact", contactRoute);

// Vendor Routes
app.use("/api/v1/vendors", vendorRoute);

// Product Routes
app.use("/api/v1/products", productRoute);

const port = process.env.PORT || 4000;

// Start the server and listen on the specified port with error handling
app
  .listen(port, () => {
    console.log(`Server running on port ${port}`);
  })
  .on("error", (err) => {
    console.error("Server error");
    process.exit(1); // Exit the process if the server fails to start
  });

// const limiter = rateLimit({
//   windowMs: 15 * 60 * 1000, // 15 minutes
//   max: 100, // limit each IP to 100 requests per windowMs
//   message: "Too many requests, please try again later.",
// });

// app.use(limiter);

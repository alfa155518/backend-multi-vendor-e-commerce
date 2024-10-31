const mongoose = require("mongoose");
const express = require("express");
const app = express();
const cors = require("cors");
const rateLimit = require("express-rate-limit");
const userRoute = require("./routes/usersRoute");
require("dotenv").config();
app.use(express.json());

app.use(
  cors({
    origin: "*", // Update this line to allow your specific frontend origin
    methods: ["GET", "POST", "PATCH", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Connect To Database with error handling
mongoose
  .connect(process.env.DATABASE_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("Database Connected");
  })
  .catch((err) => {
    console.error("Database connection error");
    process.exit(1); // Exit the process if the connection fails
  });

// User Routes Middleware
app.use("/api/v1/users", userRoute);

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

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: "Too many requests, please try again later.",
});

app.use(limiter);

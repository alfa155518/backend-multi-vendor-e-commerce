const mongoose = require("mongoose");
const express = require("express");
const app = express();
const cors = require("cors");
app.use(express.json());
// env file
require("dotenv").config();

app.use(
  cors({
    origin: "*", // Update this line to allow your specific frontend origin
    methods: ["GET", "POST", "PATCH", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

const userRoute = require("./routes/usersRoute");

// Connect To Database
mongoose.connect(process.env.DATABASE_URL).then(() => {
  console.log("Database Connected");
});

// User Routes Middleware
app.use("/api/v1/users", userRoute);

const port = process.env.PORT || 4000;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

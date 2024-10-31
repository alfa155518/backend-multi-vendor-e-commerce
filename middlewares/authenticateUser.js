const jwt = require("jsonwebtoken");

const authenticateUser = async (req, res, next) => {
  if (!req.headers.authorization) {
    return res
      .status(401)
      .json({ message: "Unauthorized access Please Create account or Login" });
  }

  const token = await req.headers["authorization"].split(" ")[1];
  if (!token) {
    return res.status(401).json({ message: "No token provided" });
  }

  jwt.verify(token, process.env.JWT_SECRET_KEY, (err, decoded) => {
    if (err) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    next();
  });
};

module.exports = authenticateUser;

const checkToken = async (req, res) => {
  // Check if Exit Headers
  if (!req.headers["authorization"]) {
    return res
      .status(401)
      .json({ message: "Unauthorized access Please Create account or Login" });
  }

  const userToken = await req.headers.authorization.split(" ")[1];

  if (!userToken) {
    return res
      .status(401)
      .json({ message: "Unauthorized access Please Create account or Login" });
  } else {
    return userToken;
  }
};

module.exports = checkToken;

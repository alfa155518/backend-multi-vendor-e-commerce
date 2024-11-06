const checkConfiguration = async (_, res, next) => {
  if (!process.env.JWT_SECRET_KEY || !process.env.JWT_EXPIRES_IN) {
    return res.status(500).json({ message: "Server configuration error" });
  }
  next();
};
module.exports = checkConfiguration;

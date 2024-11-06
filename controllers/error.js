const globalError = async (res, error) => {
  console.error(error); // Log the error for internal monitoring
  await res.status(500).json({
    message: "An unexpected error occurred on the server.",
  });
};

const validationErrors = async (res, error, status, message) => {
  const errors = Object.values(error.errors).map((err) => err.message);
  console.error(error); // Log the error for internal monitoring
  await res.status(status).json({
    message,
    errors,
  });
};

const userNotFound = async (res) => {
  await res.status(404).json({ message: "User not found" });
};

const validToken = async (res, error) => {
  if (error.name === "JsonWebTokenError") {
    return res.status(401).json({ message: "Invalid token" });
  } else if (error.name === "TokenExpiredError") {
    return res.status(401).json({ message: "Token has expired, Login" });
  } else {
    console.error(error); // Log the error for internal monitoring
    return res.status(401).json({ message: "Authentication error" });
  }
};

const duplicateKeyError = (err, res) => {
  console.error("=>>>>", err);
  return res.status(409).json({
    message: `Some One use This: change your ${JSON.stringify(
      err.keyValue.vendorName || err.keyValue.email
    )}`,
    error: err.keyValue, // This will show which field caused the error
  });
};

module.exports = {
  validationErrors,
  globalError,
  userNotFound,
  validToken,
  duplicateKeyError,
};

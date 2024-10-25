const globalError = async (res, error) => {
  await res.status(500).json({
    msg: "An unexpected error occurred on the server.",
    error: error.stack,
  });
};

const validationErrors = async (res, error, status, msg) => {
  const errors = Object.values(error.errors).map((err) => err.message);
  await res.status(status).json({
    msg,
    errors,
    error: error.stack,
  });
};

module.exports = { validationErrors, globalError };

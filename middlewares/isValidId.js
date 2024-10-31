const { isValidObjectId } = require("mongoose");

const isValidId = async (req, res, next) => {
  try {
    const { id } = await req.params;
    if (!isValidObjectId(id)) {
      return res.status(400).json({ message: "Invalid user ID format" });
    }
    next();
  } catch (error) {
    return res.status(400).json({ message: err.message });
  }
};

module.exports = isValidId;

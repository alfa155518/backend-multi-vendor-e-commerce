const cloudinary = require("cloudinary");
const dotenv = require("dotenv");

dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});
// Cloudinary Upload Image
const cloudinaryUploadImage = async (fileToUpload, folder) => {
  try {
    const data = await cloudinary.v2.uploader.upload(fileToUpload, {
      folder: `multi-vendor E-commerce/${folder}`,
      resource_type: "image",
    });
    return data;
  } catch (err) {
    return err;
  }
};

// Cloudinary removeImg Image
const cloudinaryRemoveImage = async (imagePublicId) => {
  try {
    const result = await cloudinary.uploader.destroy(imagePublicId);
    return result;
  } catch (error) {
    return error;
  }
};

module.exports = {
  cloudinaryUploadImage,
  cloudinaryRemoveImage,
};

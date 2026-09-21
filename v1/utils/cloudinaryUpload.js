import streamifier from "streamifier";
import cloudinary from "../../config/cloudinary.js";

/**
 * Cloudinary config env theke upload/delete er somoy set hoy (import er somoy na).
 * Tahole kon file age import hoyeche, .env kokhon load hoyeche, ta niye somossa hoy na.
 * Env na thakle purano config ke undefined diye overwrite kore na.
 */
const ensureCloudinaryConfig = () => {
  if (!process.env.CLOUDINARY_API_KEY) {
    console.warn(
      "⚠️ CLOUDINARY_API_KEY upload er somoy khali. .env e variable er nam check korun."
    );
    return;
  }

  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
};

/**
 * Upload a file buffer (from multer memoryStorage) to Cloudinary
 * resourceType: "image" | "video"
 */
export const uploadBufferToCloudinary = (buffer, folder, resourceType = "image") => {
  ensureCloudinaryConfig();

  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder, resource_type: resourceType },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      }
    );
    streamifier.createReadStream(buffer).pipe(stream);
  });
};

export const deleteFromCloudinary = async (publicId, resourceType = "image") => {
  if (!publicId) return;
  ensureCloudinaryConfig();

  try {
    await cloudinary.uploader.destroy(publicId, { resource_type: resourceType });
  } catch (err) {
    console.error("Failed to delete Cloudinary file:", err.message);
  }
};
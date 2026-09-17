import streamifier from "streamifier";
import cloudinary from "../../config/cloudinary.js";

/**
 * Upload a file buffer (from multer memoryStorage) to Cloudinary
 */
export const uploadBufferToCloudinary = (buffer, folder) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder, resource_type: "image" },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      }
    );
    streamifier.createReadStream(buffer).pipe(stream);
  });
};

/**
 * Delete a file from Cloudinary by its public_id
 */
export const deleteFromCloudinary = async (publicId) => {
  if (!publicId) return;
  try {
    await cloudinary.uploader.destroy(publicId);
  } catch (err) {
    console.error("Failed to delete Cloudinary file:", err.message);
  }
};
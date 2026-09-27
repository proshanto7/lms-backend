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
 *
 * Video-r jonno normal upload_stream() use korle Cloudinary-r nijer
 * default ~60s timeout-e pore jay (boro file / slow connection-e).
 * upload_chunked_stream() file-ta choto chunk-e bhag kore pathay,
 * tai ekta shingle request-er upor 60s limit-e atke thake na.
 */
export const uploadBufferToCloudinary = (buffer, folder, resourceType = "image") => {
  ensureCloudinaryConfig();

  return new Promise((resolve, reject) => {
    const isVideo = resourceType === "video";

    const uploadOptions = {
      folder,
      resource_type: resourceType,
      ...(isVideo && { chunk_size: 6_000_000 }), // 6MB por chunk
    };

    const callback = (error, result) => {
      if (error) return reject(error);
      resolve(result);
    };

    const stream = isVideo
      ? cloudinary.uploader.upload_chunked_stream(uploadOptions, callback)
      : cloudinary.uploader.upload_stream(uploadOptions, callback);

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
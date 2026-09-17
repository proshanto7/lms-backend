import multer from "multer";
import fs from "fs";

// mimetype subtype -> real file extension mapping (edge cases fix)
const MIME_EXTENSION_MAP = {
  jpeg: "jpg",
  "svg+xml": "svg",
};

function UploadMiddleware(
  allowedExtensions,
  maxFileSizeMB,
  uploadPath = "./uploads",
) {
  // ensure upload folder exists
  if (!fs.existsSync(uploadPath)) {
    fs.mkdirSync(uploadPath, { recursive: true });
  }

  const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, uploadPath);
    },
    filename: function (req, file, cb) {
      const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
      const subtype = file.mimetype.split("/")[1];
      const extension = MIME_EXTENSION_MAP[subtype] || subtype;
      cb(null, file.fieldname + "-" + uniqueSuffix + "." + extension);
    },
  });

  // File filter for controlling extensions
  const fileFilter = (req, file, cb) => {
    const subtype = file.mimetype.split("/")[1];
    const extension = MIME_EXTENSION_MAP[subtype] || subtype;

    if (allowedExtensions.includes(extension)) {
      cb(null, true);
    } else {
      cb(
        new Error(
          "Only " + allowedExtensions.join(", ") + " files are allowed!",
        ),
        false,
      );
    }
  };

  // Multer middleware to handle file uploads
  return multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: { fileSize: maxFileSizeMB * 1024 * 1024 },
  });
}

export default UploadMiddleware;
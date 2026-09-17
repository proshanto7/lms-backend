import multer from "multer";

function UploadMiddleware(allowedExtensions, maxFileSizeMB) {
  // memory storage — file buffer thake, disk-e save hoy na
  const storage = multer.memoryStorage();

  const fileFilter = (req, file, cb) => {
    const subtype = file.mimetype.split("/")[1];
    const extension = subtype === "svg+xml" ? "svg" : subtype;

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

  return multer({
    storage,
    fileFilter,
    limits: { fileSize: maxFileSizeMB * 1024 * 1024 },
  });
}

export default UploadMiddleware;
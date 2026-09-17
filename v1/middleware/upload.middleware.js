import multer from "multer";

function UploadMiddleware(allowedExtensions, maxFileSizeMB) {
  const storage = multer.memoryStorage();

  const fileFilter = (req, file, cb) => {
    const subtype = file.mimetype.split("/")[1];

    let extension = subtype;

    if (subtype === "svg+xml") {
      extension = "svg";
    }

    if (subtype === "jpeg") {
      extension = "jpg";
    }

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
    limits: {
      fileSize: maxFileSizeMB * 1024 * 1024,
    },
  });
}

export default UploadMiddleware;

import multer from "multer";

const storage = (dest) =>
  multer.diskStorage({
    destination: `./public/${dest}`,
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now();
      let ext = file.originalname.substring(
        file.originalname.lastIndexOf("."),
        file.originalname.length
      );
      cb(null, uniqueSuffix + ext);
    },
  });

const maxSize = 1024 * 1024 * 5; // 5MB

const fileFilter = (req, file, cb) => {
  if (file.mimetype.includes("application/pdf")) {
    cb(null, true);
  } else {
    cb(new Error("Invalid file type"), false);
  }
};

const uploads = (dest) =>
  multer({
    storage: storage(dest),
    fileFilter: fileFilter,
    limits: { fileSize: maxSize },
  });

export default uploads;

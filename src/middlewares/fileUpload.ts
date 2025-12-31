import multer, { FileFilterCallback } from "multer";
import path from "path";
import { Request, Express } from "express";

// MEMORY STORAGE (for S3 upload)
const storage = multer.memoryStorage();

// uploads folder NOT used anymore
// const uploadDir = path.join(process.cwd(), "uploads");

// file filter remains SAME
const fileFilter = (
  req: Request,
  file: Express.Multer.File,
  cb: FileFilterCallback
) => {
  const allowed =
    /jpeg|jpg|png|gif|pdf|mp4|avi|mov|mkv|webm/;

  const extOk = allowed.test(path.extname(file.originalname).toLowerCase());
  const mimeOk = allowed.test(file.mimetype);

  if (extOk && mimeOk) cb(null, true);
  else cb(new Error("Invalid file type"));
};

// multer instance
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 20 * 1024 * 1024, // 10 MB (adjust if needed)
  },
});

export default upload;

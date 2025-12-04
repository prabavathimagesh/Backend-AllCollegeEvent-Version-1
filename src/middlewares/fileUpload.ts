import multer, { FileFilterCallback } from "multer";
import path from "path";
import { Request, Express } from "express";

// Always use project root folder
const uploadDir = path.join(process.cwd(), "uploads");

const storage = multer.diskStorage({
  destination: (
    req: Request,
    file: Express.Multer.File,
    cb: (error: Error | null, destination: string) => void
  ) => {
    cb(null, uploadDir);
  },

  filename: (
    req: Request,
    file: Express.Multer.File,
    cb: (error: Error | null, filename: string) => void
  ) => {
    const unique = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, `${file.fieldname}-${unique}${path.extname(file.originalname)}`);
  },
});

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

const upload = multer({
  storage,
  fileFilter,
});

export default upload;

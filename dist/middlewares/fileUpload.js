"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
// MEMORY STORAGE (for S3 upload)
const storage = multer_1.default.memoryStorage();
// uploads folder NOT used anymore
// const uploadDir = path.join(process.cwd(), "uploads");
// file filter remains SAME
const fileFilter = (req, file, cb) => {
    const allowed = /jpeg|jpg|png|gif|pdf|mp4|avi|mov|mkv|webm/;
    const extOk = allowed.test(path_1.default.extname(file.originalname).toLowerCase());
    const mimeOk = allowed.test(file.mimetype);
    if (extOk && mimeOk)
        cb(null, true);
    else
        cb(new Error("Invalid file type"));
};
// multer instance
const upload = (0, multer_1.default)({
    storage,
    fileFilter,
    limits: {
        fileSize: 20 * 1024 * 1024, // 10 MB (adjust if needed)
    },
});
exports.default = upload;

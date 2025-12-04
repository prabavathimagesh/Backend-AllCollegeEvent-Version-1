"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
// Always use project root folder
const uploadDir = path_1.default.join(process.cwd(), "uploads");
const storage = multer_1.default.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const unique = Date.now() + "-" + Math.round(Math.random() * 1e9);
        cb(null, `${file.fieldname}-${unique}${path_1.default.extname(file.originalname)}`);
    },
});
const fileFilter = (req, file, cb) => {
    const allowed = /jpeg|jpg|png|gif|pdf|mp4|avi|mov|mkv|webm/;
    const extOk = allowed.test(path_1.default.extname(file.originalname).toLowerCase());
    const mimeOk = allowed.test(file.mimetype);
    if (extOk && mimeOk)
        cb(null, true);
    else
        cb(new Error("Invalid file type"));
};
const upload = (0, multer_1.default)({
    storage,
    fileFilter,
});
exports.default = upload;

import multer from "multer";
import fs from "fs";
import fsPromises from "fs/promises";
import path from "path";

export const reportStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = "./uploads/reports";
    if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const timestamp = Date.now();
    const safeName = file.originalname.replace(/\s+/g, "_").replace(ext, "");
    cb(null, `${safeName}_${timestamp}${ext}`);
  },
});

export const deleteFiles = async (attachments) => {
  if (!attachments || !Array.isArray(attachments)) return;

  for (const file of attachments) {
    if (file.path) {
      try {
        await fsPromises.unlink(path.resolve(file.path));
      } catch (err) {
        console.error(`Failed to delete file: ${file.path}`, err);
      }
    }
  }
};
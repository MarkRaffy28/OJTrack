import multer from "multer";
import { reportStorage } from "../utils/storage.util.js";

// max 5 files, field name "attachments"
export const uploadReportFiles = multer({ storage: reportStorage }).array("attachments", 5);
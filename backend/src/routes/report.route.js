import express from "express";
import { createReport, deleteReport, fetchReports, updateReport } from "../controllers/report.controller.js";
import { uploadReportFiles } from "../middlewares/upload.middleware.js";
import { verifyToken } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.post("/create", verifyToken, uploadReportFiles, createReport);
router.delete("/delete/:reportId", verifyToken, deleteReport);
router.get("/fetch/:ojtId", verifyToken, fetchReports);
router.patch("/update/:reportId", verifyToken, uploadReportFiles, updateReport);

export default router;
import express from "express";
import { createReportController, deleteReportController, fetchReportsController, updateReportController } from "../controllers/report.controller.js";
import { uploadReportFiles } from "../middlewares/upload.middleware.js";
import { verifyToken } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.post("/", verifyToken, uploadReportFiles, createReportController);
router.delete("/:reportId", verifyToken, deleteReportController);
router.get("/:ojtId", verifyToken, fetchReportsController);
router.patch("/:reportId", verifyToken, uploadReportFiles, updateReportController);

export default router;
import express from "express";
import { 
  createReportController, deleteReportController, getAdminReportsController, getReportDetailController, getReportsController, getSupervisorReportsController, 
  updateReportController, updateReportStatusController
} from "../controllers/report.controller.js";
import { uploadReportFiles } from "../middlewares/upload.middleware.js";
import { asyncHandler } from "../middlewares/asyncHandler.middleware.js";
import { verifyToken } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.delete("/:reportId", verifyToken, asyncHandler(deleteReportController));
router.get("/:ojtId", verifyToken, asyncHandler(getReportsController));
router.get("/admin/all", verifyToken, asyncHandler(getAdminReportsController));
router.get("/detail/:reportId", verifyToken, asyncHandler(getReportDetailController));
router.get("/supervisor/:supervisorId", verifyToken, asyncHandler(getSupervisorReportsController));
router.patch("/:reportId", verifyToken, uploadReportFiles, asyncHandler(updateReportController));
router.patch("/:reportId/status", verifyToken, asyncHandler(updateReportStatusController));
router.post("/", verifyToken, uploadReportFiles, asyncHandler(createReportController));

export default router;
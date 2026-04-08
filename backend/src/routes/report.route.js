import express from "express";
import { 
  createReportController, deleteReportController, getReportsController, updateReportController, getSupervisorReportsController, 
  updateReportStatusController 
} from "../controllers/report.controller.js";
import { uploadReportFiles } from "../middlewares/upload.middleware.js";
import { asyncHandler } from "../middlewares/asyncHandler.middleware.js";
import { verifyToken } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.post("/", verifyToken, uploadReportFiles, asyncHandler(createReportController));
router.delete("/:reportId", verifyToken, asyncHandler(deleteReportController));
router.get("/:ojtId", verifyToken, asyncHandler(getReportsController));
router.patch("/:reportId", verifyToken, uploadReportFiles, asyncHandler(updateReportController));
router.get("/supervisor/:supervisorId", verifyToken, asyncHandler(getSupervisorReportsController));
router.patch("/:reportId/status", verifyToken, asyncHandler(updateReportStatusController));

export default router;
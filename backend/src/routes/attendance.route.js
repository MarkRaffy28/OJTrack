import express from "express";
import { getTodayAttendanceController, scanAttendanceController, getSupervisorAttendanceController } from "../controllers/attendance.controller.js";
import { asyncHandler } from "../middlewares/asyncHandler.middleware.js";
import { verifyToken } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.get("/today", verifyToken, asyncHandler(getTodayAttendanceController));
router.get("/supervisor/:supervisorId", verifyToken, asyncHandler(getSupervisorAttendanceController));
router.post("/scan", verifyToken, asyncHandler(scanAttendanceController));

export default router;
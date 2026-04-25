import express from "express";
import { 
  getAllAttendanceController, 
  getAttendanceByIdController,
  getSupervisorAttendanceController, 
  getStudentAttendanceController,
  getTodayAttendanceController, 
  scanAttendanceController,
} from "../controllers/attendance.controller.js";
import { asyncHandler } from "../middlewares/asyncHandler.middleware.js";
import { verifyToken } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.get("/all", verifyToken, asyncHandler(getAllAttendanceController));
router.get("/today", verifyToken, asyncHandler(getTodayAttendanceController));
router.get("/student", verifyToken, asyncHandler(getStudentAttendanceController));
router.get("/supervisor/:supervisorId", verifyToken, asyncHandler(getSupervisorAttendanceController));
router.get("/:id", verifyToken, asyncHandler(getAttendanceByIdController));
router.post("/scan", verifyToken, asyncHandler(scanAttendanceController));

export default router;
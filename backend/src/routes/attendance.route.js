import express from "express";
import { getTodayAttendanceController, scanAttendanceController } from "../controllers/attendance.controller.js";
import { verifyToken } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.get("/today", verifyToken, getTodayAttendanceController);
router.post("/scan", verifyToken, scanAttendanceController);

export default router;
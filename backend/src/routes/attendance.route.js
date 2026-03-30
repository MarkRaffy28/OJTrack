import express from "express";
import { getTodayAttendance, scanAttendance } from "../controllers/attendance.controller.js";
import { verifyToken } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.get("/today", verifyToken, getTodayAttendance);
router.post("/scan", verifyToken, scanAttendance);

export default router;
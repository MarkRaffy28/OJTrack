import express from "express";
import { fetchStudentActivitiesController } from "../controllers/activity.controller.js";
import { asyncHandler } from "../middlewares/asyncHandler.middleware.js";
import { verifyToken } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.get("/student", verifyToken, asyncHandler(fetchStudentActivitiesController));

export default router;
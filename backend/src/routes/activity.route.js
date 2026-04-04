import express from "express";
import { getActivitiesController } from "../controllers/activity.controller.js";
import { asyncHandler } from "../middlewares/asyncHandler.middleware.js";
import { verifyToken } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.get("/", verifyToken, asyncHandler(getActivitiesController));

export default router;
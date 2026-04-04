import express from "express";
import { getSupervisorStatsController } from "../controllers/supervisor.controller.js";
import { verifyToken } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.get("/dashboard/:supervisorId", verifyToken, getSupervisorStatsController);

export default router;

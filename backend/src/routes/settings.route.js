import express from "express";
import { getSettingsController, updateSettingsController } from "../controllers/settings.controller.js";
import { verifyToken } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.use(verifyToken);

router.get("/", getSettingsController);
router.post("/", updateSettingsController);

export default router;

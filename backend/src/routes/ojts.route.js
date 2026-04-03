import express from "express";
import { fetchOjtsController } from "../controllers/ojt.controller.js";
import { asyncHandler } from "../middlewares/asyncHandler.middleware.js";
import { verifyToken } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.get("/:role/:databaseId", verifyToken, asyncHandler(fetchOjtsController));

export default router;
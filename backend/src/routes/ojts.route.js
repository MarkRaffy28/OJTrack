import express from "express";
import { getOjtsController, updateSupervisorNotesController } from "../controllers/ojt.controller.js";
import { asyncHandler } from "../middlewares/asyncHandler.middleware.js";
import { verifyToken } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.get("/:role/:databaseId", verifyToken, asyncHandler(getOjtsController));
router.patch("/:ojtId/notes", verifyToken, asyncHandler(updateSupervisorNotesController));

export default router;
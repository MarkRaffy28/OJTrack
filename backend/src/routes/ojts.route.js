import express from "express";

import { 
  createOjtController, deleteOjtController, getOjtsController, updateSupervisorNotesController, updateOjtController, 
  updateOjtSupervisorController
} from "../controllers/ojt.controller.js";
import { asyncHandler } from "../middlewares/asyncHandler.middleware.js";
import { verifyToken } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.delete("/:ojtId", verifyToken, asyncHandler(deleteOjtController));
router.get("/:role/:databaseId", verifyToken, asyncHandler(getOjtsController));
router.patch("/:ojtId", verifyToken, asyncHandler(updateOjtController));
router.patch("/:ojtId/notes", verifyToken, asyncHandler(updateSupervisorNotesController));
router.patch("/:ojtId/supervisor", verifyToken, asyncHandler(updateOjtSupervisorController));
router.post("/", verifyToken, asyncHandler(createOjtController));

export default router;
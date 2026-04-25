import express from "express";

import { 
  checkExistenceController, deleteTraineeController, getAdminDashboardController, getAllAdminsController, getAllSupervisorsController, 
  getProfileController, getSupervisorStatsController, updateUserProfileController, updateUserPasswordController
} from "../controllers/user.controller.js";
import { asyncHandler } from "../middlewares/asyncHandler.middleware.js";
import { verifyToken } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.get("/admins", verifyToken, asyncHandler(getAllAdminsController));
router.get("/admin/:databaseId/dashboard", verifyToken, asyncHandler(getAdminDashboardController));
router.get("/exists/:field/:value", asyncHandler(checkExistenceController));
router.get("/supervisors", verifyToken, asyncHandler(getAllSupervisorsController));
router.get("/supervisor/:supervisorId/dashboard", verifyToken, asyncHandler(getSupervisorStatsController));

router.get("/:role/:databaseId/profile", verifyToken, asyncHandler(getProfileController));

router.patch("/:role/:databaseId/profile", verifyToken, asyncHandler(updateUserProfileController));
router.patch("/:databaseId/password", verifyToken, asyncHandler(updateUserPasswordController));
router.delete("/:databaseId", verifyToken, asyncHandler(deleteTraineeController));

export default router;
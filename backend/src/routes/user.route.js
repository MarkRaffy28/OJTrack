import express from "express";
import {  checkExistenceController, getProfileController, updateUserProfileController, updateUserPasswordController } from "../controllers/user.controller.js";
import { asyncHandler } from "../middlewares/asyncHandler.middleware.js";
import { verifyToken } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.get("/exists/:field/:value", asyncHandler(checkExistenceController));

router.get("/:role/:databaseId/profile", verifyToken, asyncHandler(getProfileController));

router.patch("/:role/:databaseId/profile", verifyToken, asyncHandler(updateUserProfileController));
router.patch("/:databaseId/password", verifyToken, asyncHandler(updateUserPasswordController));

export default router;
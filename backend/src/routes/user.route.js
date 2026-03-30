import express from "express";
import { 
  checkEmail, checkUserId, checkUsername, fetchStudentInformation, fetchStudentOjts, updateStudentUserProfile, updateUserPassword 
} from "../controllers/user.controller.js";
import { verifyToken } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.get("/exists/email/:email", checkEmail);
router.get("/exists/user_id/:userId", checkUserId);
router.get("/exists/username/:username", checkUsername);
router.get("/fetch/student/:databaseId", verifyToken, fetchStudentInformation);
router.get("/fetch/student/ojt/:databaseId", verifyToken, fetchStudentOjts);
router.patch("/update/password/:databaseId", verifyToken, updateUserPassword);
router.patch("/update/profile/:databaseId", verifyToken, updateStudentUserProfile);

export default router;
import express from "express";
import { fetchStudentActivities } from "../controllers/activity.controller.js";
import { 
  checkEmail, checkUserId, checkUsername, fetchStudentProfile, fetchStudentOjts, updateStudentUserProfile, updateUserPassword 
} from "../controllers/user.controller.js";
import { verifyToken } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.get("/exists/email/:email", checkEmail);
router.get("/exists/user_id/:userId", checkUserId);
router.get("/exists/username/:username", checkUsername);
router.post("/fetch/student/activities", verifyToken, fetchStudentActivities)
router.get("/fetch/student/profile/:databaseId", verifyToken, fetchStudentProfile);
router.get("/fetch/student/ojt/:databaseId", verifyToken, fetchStudentOjts);
router.patch("/update/password/:databaseId", verifyToken, updateUserPassword);
router.patch("/update/profile/:databaseId", verifyToken, updateStudentUserProfile);

export default router;
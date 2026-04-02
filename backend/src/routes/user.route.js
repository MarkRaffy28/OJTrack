import express from "express";
import { fetchStudentActivitiesController } from "../controllers/activity.controller.js";
import { fetchStudentOjtsController } from "../controllers/ojt.controller.js";
import { 
  checkEmailController, checkUserIdController, checkUsernameController, fetchStudentProfileController, fetchSupervisorProfileController, 
  updateStudentUserProfileController, updateUserPasswordController 
} from "../controllers/user.controller.js";
import { verifyToken } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.get("/exists/email/:email", checkEmailController);
router.get("/exists/user_id/:userId", checkUserIdController);
router.get("/exists/username/:username", checkUsernameController);

router.get("/student/profile/:databaseId", verifyToken, fetchStudentProfileController);
router.get("/supervisor/profile/:databaseId", verifyToken, fetchSupervisorProfileController);

router.patch("/password/:databaseId", verifyToken, updateUserPasswordController);
router.patch("/profile/:databaseId", verifyToken, updateStudentUserProfileController);

// TODO: Refactor
router.get("/fetch/student/activities", verifyToken, fetchStudentActivitiesController);
router.get("/fetch/student/ojt/:databaseId", verifyToken, fetchStudentOjtsController);

export default router;
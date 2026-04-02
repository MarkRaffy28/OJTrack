import express from "express";
import { 
  loginController, logoutController, registerStudentController, registerSupervisorController, resetPasswordController, sendEmailVerificationOTPController, 
  sendForgotPasswordOTPController, verifyEmailOTPController
} from "../controllers/auth.controller.js";

const router = express.Router();

router.post("/login", loginController);
router.post("/logout", logoutController)
router.post("/forgot-password-otp", sendForgotPasswordOTPController);
router.post("/register/student", registerStudentController);
router.post("/register/supervisor", registerSupervisorController);
router.post("/reset-password", resetPasswordController);
router.post("/send-email-otp", sendEmailVerificationOTPController);
router.post("/verify-email-otp", verifyEmailOTPController);

export default router;
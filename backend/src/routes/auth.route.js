import express from "express";
import { 
  login, logout, registerStudent, registerSupervisor, resetPassword, sendEmailVerificationOTP, sendForgotPasswordOTP,
  verifyEmailOTP
} from "../controllers/auth.controller.js";

const router = express.Router();

router.post("/login", login);
router.post("/logout", logout)
router.post("/forgot-password-otp", sendForgotPasswordOTP);
router.post("/register/student", registerStudent);
router.post("/register/supervisor", registerSupervisor);
router.post("/reset-password", resetPassword);
router.post("/send-email-otp", sendEmailVerificationOTP);
router.post("/verify-email-otp", verifyEmailOTP);

export default router;
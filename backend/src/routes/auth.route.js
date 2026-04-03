import express from "express";
import { 
  loginController, logoutController, registerController, resetPasswordController, sendEmailVerificationOTPController, sendForgotPasswordOTPController, 
  verifyEmailOTPController
} from "../controllers/auth.controller.js";
import { asyncHandler } from "../middlewares/asyncHandler.middleware.js";

const router = express.Router();

router.post("/login", asyncHandler(loginController));
router.post("/logout", asyncHandler(logoutController))
router.post("/forgot-password-otp", asyncHandler(sendForgotPasswordOTPController));
router.post("/register/:role", asyncHandler(registerController));
router.post("/reset-password", asyncHandler(resetPasswordController));
router.post("/send-email-otp", asyncHandler(sendEmailVerificationOTPController));
router.post("/verify-email-otp", asyncHandler(verifyEmailOTPController));

export default router;
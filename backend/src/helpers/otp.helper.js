import { saveVerificationOTP, saveForgotPasswordOTP } from "../models/auth.model.js";
import { checkOTPCooldown, generateOTP, getOTPExpiry } from "../utils/otp.util.js";
import { sendOTPEmail } from "../utils/mail.util.js";

export const createSaveSendOTP = async (res, email, user, type) => {
  const expiryField = (type === "verify") ? user.email_verification_expires : user.password_reset_expires;

  const timeLeft = checkOTPCooldown(expiryField);

  if (timeLeft !== null) {
    res.status(400).json({
      message: "Please wait before resending OTP",
      timeLeftSeconds: timeLeft,
    });
    return null;
  };

  const otp = generateOTP();
  const hashedOTP = await bcrypt.hash(otp, 12);
  const expires = getOTPExpiry();

  try {
    await sendOTPEmail({
      email,
      otp,
      type,
      name: user.first_name,
    });

    if (type === "verify") {
      await saveVerificationOTP(email, hashedOTP, expires);
    } else if (type === "forgot") {
      await saveForgotPasswordOTP(email, hashedOTP, expires);
    };

  } catch (error) {
    console.error("OTP email error:", error);

    res.status(500).json({
      message: "Failed to send OTP email. Please try again.",
    });
    return null;
  };

  return otp;
};

import bcrypt from "bcrypt";

export const verifyOTP = async (res, otp, token, expires) => {
  if (!token || !expires) {
    res.status(400).json({ message: "No OTP found. Request a new one." });
    return false;
  };

  if (new Date() > new Date(expires)) {
    res.status(400).json({ message: "OTP expired. Request a new one." });
    return false;
  };

  const isMatch = await bcrypt.compare(otp, token);
  if (!isMatch) {
    res.status(400).json({ message: "Invalid OTP" });
    return false;
  };

  return true;
};
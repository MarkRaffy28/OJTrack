export const OTP_EXPIRY_MS = 5 * 60 * 1000;

export const checkOTPCooldown = (expires, cooldownMs = 5 * 60 * 1000) => {
  if (!expires) return null;

  const now = new Date();
  const expiry = new Date(expires);

  const createdAt = new Date(expiry.getTime() - OTP_EXPIRY_MS);
  const canResendAt = new Date(createdAt.getTime() + cooldownMs);

  if (now < canResendAt) {
    return Math.ceil((canResendAt - now) / 1000);
  }

  return null;
};

export const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

export const getOTPExpiry = () => {
  return new Date(Date.now() + OTP_EXPIRY_MS);
};
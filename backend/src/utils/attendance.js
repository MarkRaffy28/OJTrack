import crypto from "crypto";

const SECRET = process.env.QR_SECRET;

export const verifyQr = (o, t, s) => {
  const expected = crypto
    .createHmac("sha256", SECRET)
    .update(`${o}|${t}`)
    .digest("hex");

  if (expected !== s) {
    throw new Error("Invalid QR signature");
  }

  const now = Date.now();

  if (now - t > 60000) {
    throw new Error("QR expired");
  }
}

export const determineSession = () => {
  const now = new Date();
  const hour = now.getHours();
  const minute = now.getMinutes();
  const totalMinutes = hour * 60 + minute;

  if (totalMinutes >= 6 * 60 && totalMinutes < 10 * 60) return "morning_in";
  if (totalMinutes >= 10 * 60 && totalMinutes < 12 * 60 + 29) return "morning_out";
  if (totalMinutes >= 12 * 60 + 30 && totalMinutes < 15 * 60) return "afternoon_in";
  if (totalMinutes >= 15 * 60 && totalMinutes < 18 * 60) return "afternoon_out";  

  throw new Error("Outside attendance time");
};
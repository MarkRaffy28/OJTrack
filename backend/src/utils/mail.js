import fs from "fs";
import path from "path";
import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user:  process.env.GMAIL_ADDRESS, 
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

const buildOtpDigits = (otp) => {
  return otp
    .split("")
    .map((char, i) => {
      if (i === 3) {
        return `
          <span class="otp-sep">–</span>
          <span class="otp-digit">${char}</span>
      `};
      return `<span class="otp-digit">${char}</span>`;
    })
    .join("");
};

const renderTemplate = (data) => {
  const templatePath = path.join(process.cwd(), "src", "utils", "emailTemplate.html");
  let html = fs.readFileSync(templatePath, "utf-8");

  data.otp_digits = buildOtpDigits(data.otp);

  Object.keys(data).forEach((key) => {
    const value = data[key];
    html = html.replace(new RegExp(`{{${key}}}`, "g"), value);
  });

  return html;
};

export const sendOTPEmail = async ({ email, otp, type, name }) => {
  let subject, content;

  if (type === "verify") {
    subject = "Verify Your Email";
    content = {
      title: "Verify Your Email",
      description: "Use the code below to verify your email address and activate your account.",
      otp_label: "Verification Code",
    };
  } else if (type === "forgot") {
    subject = "Reset Your Password";
    content = {
      title: "Reset Your Password",
      description: "Use the code below to reset your password.",
      otp_label: "Password Reset Code",
    };
  }

  const html = renderTemplate({
    ...content,
    otp,
    name: name || "User",
  });

  await transporter.sendMail({
    from: `"OJTrack" <${process.env.GMAIL_ADDRESS}>`,
    to: email,
    subject,
    html,
  });
};
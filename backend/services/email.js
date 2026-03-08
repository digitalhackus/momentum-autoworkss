/**
 * Email service using Nodemailer.
 * Uses env: MAIL_HOST, MAIL_PORT, MAIL_USER, MAIL_PASS, MAIL_FROM (optional).
 * OTP is only sent to the user's email; it is never returned to the client.
 */

const nodemailer = require("nodemailer");

function getTransporter() {
  const host = process.env.MAIL_HOST;
  const port = process.env.MAIL_PORT;
  const user = process.env.MAIL_USER;
  const pass = process.env.MAIL_PASS;
  if (!host || !user || !pass) return null;
  return nodemailer.createTransport({
    host: host || "smtp.gmail.com",
    port: parseInt(port, 10) || 587,
    secure: false,
    auth: { user, pass },
  });
}

/**
 * Send OTP to user email. OTP is never returned to the client.
 * @param {string} to - Recipient email
 * @param {string} otp - 6-digit OTP
 * @returns {Promise<{ sent: boolean, notConfigured?: boolean }>}
 */
async function sendOtpEmail(to, otp) {
  const transporter = getTransporter();
  const from = process.env.MAIL_FROM || process.env.MAIL_USER || "noreply@example.com";
  const subject = "Your verification code - Momentum Autoworks";
  const text = `Your verification code is: ${otp}. It expires in 10 minutes.`;
  const html = `<p>Your verification code is: <strong>${otp}</strong>.</p><p>It expires in 10 minutes.</p>`;

  if (!transporter) {
    return { sent: false, notConfigured: true };
  }

  try {
    await transporter.sendMail({ from, to, subject, text, html });
    return { sent: true };
  } catch (err) {
    console.error("[Email] Send failed:", err.message);
    return { sent: false };
  }
}

module.exports = { sendOtpEmail };

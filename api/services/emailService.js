const nodemailer = require('nodemailer');

const smtpHost = process.env.SMTP_HOST;
const smtpPort = process.env.SMTP_PORT || 587;
const smtpUser = process.env.SMTP_USER;
const smtpPass = process.env.SMTP_PASS;
const fromEmail = process.env.SMTP_FROM || 'no-reply@vibelearn.id';

let transporter = null;

if (smtpHost && smtpUser && smtpPass) {
  transporter = nodemailer.createTransport({
    host: smtpHost,
    port: parseInt(smtpPort),
    secure: parseInt(smtpPort) === 465,
    auth: {
      user: smtpUser,
      pass: smtpPass,
    },
  });
}

/**
 * Send email helper with fallback log
 */
async function sendMail({ to, subject, html, text }) {
  if (!transporter) {
    console.log(`[EMAIL SIMULATOR] To: ${to} | Subject: ${subject}`);
    console.log(`[EMAIL SIMULATOR] Body: ${text || subject}`);
    return { simulated: true };
  }

  try {
    const info = await transporter.sendMail({
      from: `"Promptara AI Academy" <${fromEmail}>`,
      to,
      subject,
      text,
      html,
    });
    console.log(`[EMAIL SENT] MessageId: ${info.messageId} to ${to}`);
    return info;
  } catch (err) {
    console.error(`[EMAIL ERROR] Failed to send email to ${to}:`, err.message);
    throw err;
  }
}

/**
 * Send Welcome Email
 */
async function sendWelcomeEmail(toEmail, userName) {
  const subject = 'Welcome to Promptara AI Coding Academy! 🚀';
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #0f172a; color: #f8fafc; border-radius: 12px;">
      <h2 style="color: #a855f7;">Welcome to Promptara, ${userName}! 👋</h2>
      <p style="font-size: 16px; line-height: 1.6; color: #cbd5e1;">
        We're excited to have you join our AI-powered Vibe Coding Academy. Get ready to master modern software development with AI collaboration.
      </p>
      <div style="margin: 30px 0; text-align: center;">
        <a href="https://vibe.virtuenet.space/dashboard" style="background: linear-gradient(135deg, #7c3aed, #06b6d4); color: #ffffff; text-decoration: none; padding: 12px 28px; border-radius: 8px; font-weight: bold; display: inline-block;">
          Go to Your Dashboard
        </a>
      </div>
      <p style="font-size: 14px; color: #94a3b8;">
        If you have any questions, feel free to reply to this email. Happy vibe coding!
      </p>
    </div>
  `;
  return sendMail({ to: toEmail, subject, html, text: `Welcome to Promptara, ${userName}!` });
}

/**
 * Send Password Reset Email
 */
async function sendPasswordResetEmail(toEmail, resetToken) {
  const resetLink = `https://vibe.virtuenet.space/login?reset_token=${resetToken}`;
  const subject = 'Reset Your Promptara Password 🔑';
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #0f172a; color: #f8fafc; border-radius: 12px;">
      <h2 style="color: #38bdf8;">Password Reset Request</h2>
      <p style="font-size: 16px; line-height: 1.6; color: #cbd5e1;">
        We received a request to reset your password. Click the button below to choose a new password. This link is valid for 1 hour.
      </p>
      <div style="margin: 30px 0; text-align: center;">
        <a href="${resetLink}" style="background: #0284c7; color: #ffffff; text-decoration: none; padding: 12px 28px; border-radius: 8px; font-weight: bold; display: inline-block;">
          Reset Password
        </a>
      </div>
      <p style="font-size: 13px; color: #64748b;">
        If you did not request a password reset, you can safely ignore this email.
      </p>
    </div>
  `;
  return sendMail({ to: toEmail, subject, html, text: `Reset link: ${resetLink}` });
}

module.exports = {
  sendWelcomeEmail,
  sendPasswordResetEmail,
};

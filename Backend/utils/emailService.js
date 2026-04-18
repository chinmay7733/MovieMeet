const nodemailer = require("nodemailer");

const APP_NAME = process.env.APP_NAME || "MovieMeet";
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";

const isMailConfigured = () =>
  Boolean(
    process.env.SMTP_HOST &&
      process.env.SMTP_PORT &&
      process.env.SMTP_USER &&
      process.env.SMTP_PASS
  );

let transporter;

const getTransporter = () => {
  if (!isMailConfigured()) {
    return null;
  }

  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT),
      secure: process.env.SMTP_SECURE === "true",
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }

  return transporter;
};

const sendEmail = async ({ to, subject, text, html }) => {
  const mailTransporter = getTransporter();

  if (!mailTransporter) {
    console.warn(`Email skipped for ${to}: SMTP configuration missing.`);
    return { skipped: true };
  }

  return mailTransporter.sendMail({
    from: process.env.MAIL_FROM || `${APP_NAME} <${process.env.SMTP_USER}>`,
    to,
    subject,
    text,
    html,
  });
};

const sendWelcomeEmail = async ({ name, email }) => {
  const safeName = name || "there";
  const subject = `Welcome to ${APP_NAME}`;
  const text =
    `Hi ${safeName},\n\n` +
    `Your ${APP_NAME} account has been created successfully.\n` +
    `Registered email: ${email}\n` +
    `Login here: ${FRONTEND_URL}/login\n\n` +
    "For security reasons, your password is never sent by email.\n\n" +
    `Thanks,\n${APP_NAME}`;
  const html = `
    <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #0f172a;">
      <h2 style="margin-bottom: 12px;">Welcome to ${APP_NAME}</h2>
      <p>Hi ${safeName},</p>
      <p>Your account has been created successfully.</p>
      <p><strong>Registered email:</strong> ${email}</p>
      <p>
        You can sign in here:
        <a href="${FRONTEND_URL}/login">${FRONTEND_URL}/login</a>
      </p>
      <p><strong>Security note:</strong> your password is never sent by email.</p>
      <p>Thanks,<br />${APP_NAME}</p>
    </div>
  `;

  return sendEmail({ to: email, subject, text, html });
};

const sendLoginAlertEmail = async ({ name, email }) => {
  const safeName = name || "there";
  const loginTime = new Date().toLocaleString("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  });
  const subject = `${APP_NAME} login alert`;
  const text =
    `Hi ${safeName},\n\n` +
    `A login to your ${APP_NAME} account was detected.\n` +
    `Time: ${loginTime}\n` +
    `Email: ${email}\n\n` +
    "If this was you, no action is needed. If not, reset your password immediately.\n\n" +
    `Thanks,\n${APP_NAME}`;
  const html = `
    <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #0f172a;">
      <h2 style="margin-bottom: 12px;">${APP_NAME} Login Alert</h2>
      <p>Hi ${safeName},</p>
      <p>A login to your account was detected.</p>
      <p><strong>Time:</strong> ${loginTime}</p>
      <p><strong>Email:</strong> ${email}</p>
      <p>If this was not you, please reset your password immediately.</p>
      <p>Thanks,<br />${APP_NAME}</p>
    </div>
  `;

  return sendEmail({ to: email, subject, text, html });
};

const sendPasswordResetOtpEmail = async ({ name, email, otp }) => {
  const safeName = name || "there";
  const subject = `${APP_NAME} password reset OTP`;
  const text =
    `Hi ${safeName},\n\n` +
    "We received a request to reset your password.\n" +
    `Your OTP is: ${otp}\n\n` +
    "Enter this OTP on the reset password screen. This code will expire soon.\n" +
    "If you did not request this, you can ignore this email.\n\n" +
    `Thanks,\n${APP_NAME}`;
  const html = `
    <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #0f172a;">
      <h2 style="margin-bottom: 12px;">${APP_NAME} Password Reset OTP</h2>
      <p>Hi ${safeName},</p>
      <p>We received a request to reset your password.</p>
      <p style="margin: 18px 0;">
        <span
          style="display:inline-block;padding:12px 18px;background:#0f172a;color:#fff;border-radius:16px;font-size:24px;font-weight:800;letter-spacing:0.35em;"
        >
          ${otp}
        </span>
      </p>
      <p>Enter this OTP on the reset password screen. This code will expire soon.</p>
      <p>If you did not request this, just ignore this email.</p>
      <p>Thanks,<br />${APP_NAME}</p>
    </div>
  `;

  const result = await sendEmail({ to: email, subject, text, html });

  if (result?.skipped) {
    console.warn(`Password reset OTP for ${email}: ${otp}`);
  }

  return result;
};

const sendPasswordChangedEmail = async ({ name, email }) => {
  const safeName = name || "there";
  const changedTime = new Date().toLocaleString("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  });
  const subject = `${APP_NAME} password changed`;
  const text =
    `Hi ${safeName},\n\n` +
    `Your ${APP_NAME} password was changed on ${changedTime}.\n` +
    "If this was not you, please reset your password immediately.\n\n" +
    `Thanks,\n${APP_NAME}`;
  const html = `
    <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #0f172a;">
      <h2 style="margin-bottom: 12px;">${APP_NAME} Password Changed</h2>
      <p>Hi ${safeName},</p>
      <p>Your password was changed on <strong>${changedTime}</strong>.</p>
      <p>If this was not you, please reset your password immediately.</p>
      <p>Thanks,<br />${APP_NAME}</p>
    </div>
  `;

  return sendEmail({ to: email, subject, text, html });
};

const sendBookingCompletedEmail = async ({
  name,
  email,
  bookingId,
  eventTitle,
  seatNumber,
  eventDate,
  location,
}) => {
  const safeName = name || "there";
  const formattedEventDate = eventDate
    ? new Date(eventDate).toLocaleString("en-IN", {
        dateStyle: "medium",
        timeStyle: "short",
      })
    : "To be announced";
  const bookingTime = new Date().toLocaleString("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  });
  const bookingsUrl = `${FRONTEND_URL}/bookings`;
  const subject = `${APP_NAME} booking completed`;
  const text =
    `Hi ${safeName},\n\n` +
    "Congratulations. Your booking is completed.\n\n" +
    `Booking ID: ${bookingId}\n` +
    `Event: ${eventTitle}\n` +
    `Seat: ${seatNumber}\n` +
    `Date & Time: ${formattedEventDate}\n` +
    `Location: ${location || "Venue to be announced"}\n` +
    `Booked On: ${bookingTime}\n\n` +
    `You can review your booking here: ${bookingsUrl}\n\n` +
    `Thanks,\n${APP_NAME}`;
  const html = `
    <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #0f172a;">
      <h2 style="margin-bottom: 12px;">Booking Completed</h2>
      <p>Hi ${safeName},</p>
      <p><strong>Congratulations. Your booking is completed.</strong></p>
      <div style="margin: 18px 0; padding: 18px; border-radius: 18px; background: #fff7ed; border: 1px solid #fed7aa;">
        <p style="margin: 0 0 8px;"><strong>Booking ID:</strong> ${bookingId}</p>
        <p style="margin: 0 0 8px;"><strong>Event:</strong> ${eventTitle}</p>
        <p style="margin: 0 0 8px;"><strong>Seat:</strong> ${seatNumber}</p>
        <p style="margin: 0 0 8px;"><strong>Date & Time:</strong> ${formattedEventDate}</p>
        <p style="margin: 0 0 8px;"><strong>Location:</strong> ${location || "Venue to be announced"}</p>
        <p style="margin: 0;"><strong>Booked On:</strong> ${bookingTime}</p>
      </div>
      <p>
        You can review your booking here:
        <a href="${bookingsUrl}">${bookingsUrl}</a>
      </p>
      <p>Thanks,<br />${APP_NAME}</p>
    </div>
  `;

  return sendEmail({ to: email, subject, text, html });
};

module.exports = {
  sendWelcomeEmail,
  sendLoginAlertEmail,
  sendPasswordResetOtpEmail,
  sendPasswordChangedEmail,
  sendBookingCompletedEmail,
};

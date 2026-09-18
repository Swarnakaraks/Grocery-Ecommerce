import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASSWORD,
  },
});

export const sendOtpEmail = async (email, otp) => {
  const info = await transporter.sendMail({
    from: `"FreshMart" <${process.env.MAIL_USER}>`,
    to: email,
    subject: "FreshMart Password Reset OTP",
    text: `Your FreshMart password reset OTP is ${otp}. It will expire in 10 minutes.`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto;">
        <h2>FreshMart Password Reset</h2>

        <p>You requested to reset your FreshMart password.</p>

        <p>Your OTP is:</p>

        <h1 style="letter-spacing: 8px;">${otp}</h1>

        <p>This OTP will expire in <strong>10 minutes</strong>.</p>

        <p>If you did not request this, you can safely ignore this email.</p>

        <hr />

        <p>FreshMart Security Team</p>
      </div>
    `,
  });

  console.log("Email sent:", info.messageId);

  return info;
};

export const sendVerificationEmail = async (
  email,
  fullName,
  verificationUrl
) => {
  const info = await transporter.sendMail({
    from: `"FreshMart" <${process.env.MAIL_USER}>`,
    to: email,
    subject: "Verify Your FreshMart Email",
    text: `Hello ${fullName}, please verify your FreshMart email address using this link: ${verificationUrl}`,
    html: `
      <div style="
        font-family: Arial, sans-serif;
        max-width: 600px;
        margin: auto;
        background-color: #f8fafc;
        padding: 30px;
      ">
        <div style="
          background-color: #ffffff;
          padding: 40px;
          border-radius: 12px;
          text-align: center;
        ">
          <h1 style="color: #16a34a;">
            Welcome to FreshMart
          </h1>

          <p style="font-size: 16px; color: #334155;">
            Hello ${fullName},
          </p>

          <p style="
            font-size: 15px;
            line-height: 1.6;
            color: #64748b;
          ">
            Thank you for creating your FreshMart account.
            Please verify your email address to activate your account.
          </p>

          <div style="margin: 30px 0;">
            <a
              href="${verificationUrl}"
              style="
                display: inline-block;
                padding: 14px 28px;
                background-color: #16a34a;
                color: #ffffff;
                text-decoration: none;
                border-radius: 8px;
                font-size: 16px;
                font-weight: bold;
              "
            >
              Verify Email
            </a>
          </div>

          <p style="
            font-size: 13px;
            color: #94a3b8;
          ">
            This verification link will expire in 24 hours.
          </p>

          <p style="
            font-size: 13px;
            color: #94a3b8;
          ">
            If you did not create this account,
            you can safely ignore this email.
          </p>

          <hr />

          <p style="
            font-size: 13px;
            color: #94a3b8;
          ">
            FreshMart Security Team
          </p>
        </div>
      </div>
    `,
  });

  console.log("Verification email sent:", info.messageId);

  return info;
};
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
    from: `"SajiloKinmel" <${process.env.MAIL_USER}>`,
    to: email,
    subject: "SajiloKinmel Password Reset OTP",
    text: `Your SajiloKinmel password reset OTP is ${otp}. It will expire in 10 minutes.`,
    html: `
      <div style="
        margin: 0;
        padding: 30px 15px;
        background-color: #f8fafc;
        font-family: Arial, Helvetica, sans-serif;
      ">
        <div style="
          max-width: 560px;
          margin: 0 auto;
          background-color: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 10px;
          overflow: hidden;
        ">

          <!-- header -->
          <div style="
            padding: 22px 30px;
            border-bottom: 1px solid #e2e8f0;
            background-color: #ffffff;
          ">
            <h2 style="
              margin: 0;
              color: #15803d;
              font-size: 22px;
              font-weight: 700;
            ">
              SajiloKinmel
            </h2>
          </div>

          <!-- content -->
          <div style="padding: 32px 30px;">

            <h1 style="
              margin: 0 0 18px;
              color: #0f172a;
              font-size: 24px;
              font-weight: 600;
            ">
              Password Reset
            </h1>

            <p style="
              margin: 0 0 12px;
              color: #475569;
              font-size: 15px;
              line-height: 1.6;
            ">
              You requested to reset your SajiloKinmel account password.
              Use the verification code below to continue.
            </p>

            <div style="
              margin: 28px 0;
              padding: 18px;
              background-color: #f0fdf4;
              border: 1px solid #bbf7d0;
              border-radius: 8px;
              text-align: center;
            ">
              <div style="
                margin-bottom: 8px;
                color: #64748b;
                font-size: 12px;
                text-transform: uppercase;
                letter-spacing: 1px;
              ">
                Verification Code
              </div>

              <div style="
                color: #166534;
                font-size: 30px;
                font-weight: 700;
                letter-spacing: 8px;
              ">
                ${otp}
              </div>
            </div>

            <p style="
              margin: 0 0 12px;
              color: #475569;
              font-size: 14px;
              line-height: 1.6;
            ">
              This code will expire in <strong>10 minutes</strong>.
            </p>

            <p style="
              margin: 0;
              color: #64748b;
              font-size: 14px;
              line-height: 1.6;
            ">
              If you did not request a password reset, you can safely ignore
              this email.
            </p>

          </div>

          <!-- footer -->
          <div style="
            padding: 18px 30px;
            border-top: 1px solid #e2e8f0;
            background-color: #f8fafc;
          ">
            <p style="
              margin: 0;
              color: #94a3b8;
              font-size: 12px;
              line-height: 1.5;
            ">
              This is an automated security email from SajiloKinmel.
            </p>
          </div>

        </div>
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
    from: `"SajiloKinmel" <${process.env.MAIL_USER}>`,
    to: email,
    subject: "Verify Your SajiloKinmel Email",
    text: `Hello ${fullName}, please verify your SajiloKinmel email address using this link: ${verificationUrl}`,
    html: `
      <div style="
        margin: 0;
        padding: 30px 15px;
        background-color: #ffffff;
        font-family: Arial, Helvetica, sans-serif;
      ">
        <div style="
          max-width: 560px;
          margin: 0 auto;
          background-color: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 10px;
          overflow: hidden;
        ">

          <!-- header -->
          <div style="
            padding: 22px 30px;
            border-bottom: 1px solid #e2e8f0;
            background-color: #ffffff;
          ">
            <h2 style="
              margin: 0;
              color: #15803d;
              font-size: 22px;
              font-weight: 700;
            ">
              SajiloKinmel
            </h2>
          </div>

          <!-- content -->
          <div style="padding: 32px 30px;">

            <h1 style="
              margin: 0 0 18px;
              color: #0f172a;
              font-size: 24px;
              font-weight: 600;
            ">
              Verify Your Email
            </h1>

            <p style="
              margin: 0 0 12px;
              color: #334155;
              font-size: 15px;
              line-height: 1.6;
            ">
              Hello ${fullName},
            </p>

            <p style="
              margin: 0;
              color: #64748b;
              font-size: 14px;
              line-height: 1.7;
            ">
              Thank you for creating your SajiloKinmel account.
              Please verify your email address to complete your registration.
            </p>

            <div style="
              margin: 28px 0;
              text-align: center;
            ">
              <a
                href="${verificationUrl}"
                style="
                  display: inline-block;
                  padding: 13px 26px;
                  background-color: #16a34a;
                  color: #ffffff;
                  text-decoration: none;
                  border-radius: 7px;
                  font-size: 14px;
                  font-weight: 600;
                "
              >
                Verify Email
              </a>
            </div>

            <p style="
              margin: 0 0 12px;
              color: #94a3b8;
              font-size: 12px;
              line-height: 1.6;
            ">
              This verification link will expire in 10 minutes.
            </p>

            <p style="
              margin: 0;
              color: #94a3b8;
              font-size: 12px;
              line-height: 1.6;
            ">
              If you did not create this account, you can safely ignore
              this email.
            </p>

          </div>   

        </div>
      </div>
    `,
  });

  console.log("Verification email sent:", info.messageId);

  return info;
};
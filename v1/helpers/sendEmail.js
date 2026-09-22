import "dotenv/config";
import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",

  auth: {
    user: process.env.AUTH_EMAIL,
    pass: process.env.AUTH_PASSWORD,
  },
});

export const verifyEmailTransporter = async () => {
  try {
    await transporter.verify();
    console.log("✅ Email transporter is ready");
  } catch (error) {
    console.error("❌ Email transporter error:", error.message);
  }
};

export const sendEmail = async (email, otp, type) => {
  const isSignupType = type === "signup" || type === "resentOpt";
  const isForgotPassword = type === "forgot-password";

  let subject;
  let title;
  let message;
  let expiry;

  // =========================
  // Signup / Email Verification
  // =========================
  if (isSignupType) {
    subject = "Edu-Nova Email Verification Code";
    title = "Verify Your Email";
    message =
      "Use the verification code below to complete your email verification.";
    expiry = "2 minutes";
  }

  // =========================
  // Forgot Password
  // =========================
  else if (isForgotPassword) {
    subject = "Edu-Nova Password Reset Code";
    title = "Reset Your Password";
    message =
      "Use the verification code below to reset your Edu-Nova account password.";
    expiry = "10 minutes";
  }

  // =========================
  // Other OTP
  // =========================
  else {
    subject = "Edu-Nova Verification Code";
    title = "Verification Code";
    message =
      "Use the verification code below to continue with your Edu-Nova account.";
    expiry = "10 minutes";
  }

  // =========================
  // Plain Text Email
  // =========================

  const textContent = `
${title}

${message}

Your verification code: ${otp}

This code is valid for ${expiry}.

For your security, do not share this code with anyone.

If you did not request this code, you can safely ignore this email.

© 2026 EDU-NOVA. All rights reserved.
  `.trim();

  // =========================
  // HTML Email
  // =========================

  const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta
    name="viewport"
    content="width=device-width, initial-scale=1.0"
  />
  <title>${title}</title>
</head>

<body
  style="
    margin: 0;
    padding: 0;
    background-color: #f4f6f8;
    font-family: Arial, Helvetica, sans-serif;
  "
>

  <table
    width="100%"
    cellpadding="0"
    cellspacing="0"
    border="0"
    style="
      background-color: #f4f6f8;
      padding: 40px 15px;
    "
  >
    <tr>
      <td align="center">

        <table
          width="600"
          cellpadding="0"
          cellspacing="0"
          border="0"
          style="
            max-width: 600px;
            width: 100%;
            background-color: #ffffff;
            border-radius: 10px;
            overflow: hidden;
            border: 1px solid #e5e7eb;
          "
        >

          <!-- Header -->
          <tr>
            <td
              align="center"
              style="
                background-color: #4a90e2;
                padding: 24px 20px;
                color: #ffffff;
              "
            >
              <div
                style="
                  font-size: 24px;
                  font-weight: bold;
                  margin-bottom: 6px;
                "
              >
                EDU-NOVA
              </div>

              <div
                style="
                  font-size: 14px;
                  opacity: 0.95;
                "
              >
                ${title}
              </div>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td
              style="
                padding: 35px 30px;
                text-align: center;
                color: #333333;
              "
            >

              <p
                style="
                  margin: 0 0 20px;
                  font-size: 16px;
                  line-height: 1.6;
                  color: #444444;
                "
              >
                ${message}
              </p>

              <!-- OTP -->
              <div
                style="
                  display: inline-block;
                  padding: 14px 28px;
                  margin: 10px 0 20px;
                  background-color: #f0f7ff;
                  border: 1px dashed #4a90e2;
                  border-radius: 6px;
                  color: #4a90e2;
                  font-size: 30px;
                  font-weight: bold;
                  letter-spacing: 7px;
                "
              >
                ${otp}
              </div>

              <p
                style="
                  margin: 0 0 12px;
                  font-size: 14px;
                  line-height: 1.6;
                  color: #555555;
                "
              >
                This code is valid for
                <strong>${expiry}</strong>.
              </p>

              <p
                style="
                  margin: 0;
                  font-size: 13px;
                  line-height: 1.6;
                  color: #777777;
                "
              >
                For your security, never share this code with anyone.
              </p>

            </td>
          </tr>

          <!-- Security Notice -->
          <tr>
            <td
              style="
                padding: 18px 30px;
                background-color: #fafafa;
                border-top: 1px solid #eeeeee;
                text-align: center;
              "
            >
              <p
                style="
                  margin: 0;
                  font-size: 12px;
                  line-height: 1.6;
                  color: #777777;
                "
              >
                If you did not request this code, you can safely ignore
                this email.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td
              align="center"
              style="
                background-color: #f5f5f5;
                padding: 16px;
                color: #888888;
                font-size: 12px;
              "
            >
              © 2026 EDU-NOVA. All rights reserved.
            </td>
          </tr>

        </table>

      </td>
    </tr>
  </table>

</body>
</html>
  `.trim();

  // =========================
  // Send Email
  // =========================

  const info = await transporter.sendMail({
    from: `"EDU-NOVA" <${process.env.AUTH_EMAIL}>`,
    to: email,
    subject,

    // Plain text fallback
    text: textContent,

    // HTML version
    html: htmlContent,
  });

  console.log(`✅ Email sent successfully to ${email}`);

  return info;
};

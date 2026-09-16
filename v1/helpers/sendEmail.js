import "dotenv/config";
import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",

  auth: {
    user: process.env.AUTH_EMAIL,
    pass: process.env.AUTH_PASSWORD,
  },
});

// Optional: server start করার সময় SMTP check করতে পারবে
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

  if (isSignupType) {
    subject = "Your One-Time Password (OTP) for Verification";

    title = "Secure Verification";

    message =
      "Use the following One-Time Password (OTP) to complete your email verification.";

    expiry = "2 minutes";
  } else if (isForgotPassword) {
    subject = "Your One-Time Password (OTP) for Password Reset";

    title = "Reset Password Verification";

    message =
      "Use the following One-Time Password (OTP) to reset your password.";

    expiry = "10 minutes";
  } else {
    subject = "Your One-Time Password (OTP)";

    title = "OTP Verification";

    message = "Use the following One-Time Password (OTP) to continue.";

    expiry = "10 minutes";
  }

  const info = await transporter.sendMail({
    from: `"Edu-Nova LMS" <${process.env.AUTH_EMAIL}>`,
    to: email,
    subject,

    html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${title}</title>
</head>

<body
  style="
    margin:0;
    padding:0;
    background-color:#f4f4f4;
    font-family:Arial,sans-serif;
  "
>

<table
  width="100%"
  cellpadding="0"
  cellspacing="0"
  style="
    background-color:#f4f4f4;
    padding:30px 0;
  "
>

<tr>
<td align="center">

<table
  width="600"
  cellpadding="0"
  cellspacing="0"
  style="
    background-color:#ffffff;
    border-radius:8px;
    overflow:hidden;
    box-shadow:0 2px 6px rgba(0,0,0,0.1);
  "
>

<tr>
<td
  align="center"
  style="
    background-color:#4a90e2;
    color:#ffffff;
    padding:20px;
    font-size:24px;
    font-weight:bold;
  "
>
  ${title}
</td>
</tr>

<tr>
<td
  style="
    padding:30px;
    text-align:center;
    color:#333333;
  "
>

<p
  style="
    margin:0;
    font-size:16px;
    line-height:1.6;
  "
>
  ${message}
</p>

<div
  style="
    display:inline-block;
    background-color:#f0f8ff;
    border:2px dashed #4a90e2;
    padding:15px 25px;
    font-size:28px;
    font-weight:bold;
    letter-spacing:5px;
    margin:20px 0;
    color:#4a90e2;
  "
>
  ${otp}
</div>

<p
  style="
    margin:0;
    font-size:14px;
    color:#555555;
  "
>
  This OTP is valid for
  <strong>${expiry}</strong>.
  Do not share it with anyone.
</p>

</td>
</tr>

<tr>
<td
  align="center"
  style="
    background-color:#f9f9f9;
    padding:15px;
    font-size:12px;
    color:#777777;
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
    `,
  });

  return info;
};

import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_MAIL_HOST,
  //   port: Number(process.env.SMTP_PORT),
  secure: true,
  auth: {
    user: process.env.SMTP_MAIL_USER,
    pass: process.env.SMTP_MAIL_PASS,
  },
});

export async function sendVerificationEmail(
  email: string,
  token: string,
  otp: number
) {
  try {
    const verificationUrl = `${process.env.NEXTAUTH_URL}/verify?token=${token}`;

    await transporter.sendMail({
      from: process.env.SMTP_FROM,
      to: email,
      subject: "Verify your email address",
      html: `
        <div>
          <h1>Verify your email address</h1>
          <p>Click the link below to verify your email address:</p>
          <a href="${verificationUrl}">${verificationUrl}</a>
          <p>${otp}</p>
        </div>
      `,
    });
  } catch (error) {
    console.error("Error sending verification email:", error);
    throw new Error("Failed to send verification email");
  }
}

export async function sendNewPassword(email: string, password: string) {
  try {
    await transporter.sendMail({
      from: process.env.SMTP_FROM,
      to: email,
      subject: "Your New Password",
      text: `Hello,\n\nYour new password is: ${password}\n\nPlease change it after logging in.\n\nBest Regards,\nYour Company`,
    });
  } catch (error) {
    throw new Error("Failed to send verification email");
  }
}

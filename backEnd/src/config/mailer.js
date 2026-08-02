
import { BrevoClient } from "@getbrevo/brevo";
const brevo = new BrevoClient({
  apiKey: process.env.BREVO_API_KEY,
});

export const sendOtpEmail = async (email, otp) => {
  try {
    await brevo.transactionalEmails.sendTransacEmail({
      subject: "Verify your account",
      htmlContent: `
        <h2>OTP Verification</h2>
        <p>Your OTP is: <b>${otp}</b></p>
        <p>This OTP will expire in 5 minutes.</p>
      `,
      sender: { name: "Chatty", email: "himanshukamboj5095@gmail.com" },
      to: [{ email }],
    });
  } catch (error) {
    console.log("Brevo error:", error?.body || error?.message || error);
    throw new Error("Failed to send OTP email");
  }
};
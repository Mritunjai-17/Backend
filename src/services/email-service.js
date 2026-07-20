const resend = require("../config/resend");

const sendTestEmail = async () => {
  try {
    const response = await resend.emails.send({
      from: process.env.FROM_EMAIL || "onboarding@resend.dev",
      to: process.env.ADMIN_EMAIL,
      subject: "Welcome to MIDIS CMS",
      html: `
        <h2>Hello 👋</h2>
        <p>Your Resend integration is working successfully.</p>
      `,
    });

    console.log("✅ Email sent successfully", response);
    return response;
  } catch (error) {
    console.error("❌ Failed to send email", error);
  }
};

module.exports = {
  sendTestEmail,
};
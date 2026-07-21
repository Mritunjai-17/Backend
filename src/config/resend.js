const { Resend } = require("resend");

const getResendClient = () => {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey || apiKey.trim() === "") {
    return null;
  }
  try {
    return new Resend(apiKey);
  } catch (error) {
    console.error("⚠️ Resend Initialization Error:", error.message);
    return null;
  }
};

const resend = {
  emails: {
    send: async (payload) => {
      const client = getResendClient();
      if (!client) {
        console.warn("⚠️ Email not sent: RESEND_API_KEY is missing in environment variables.");
        return { error: { message: "RESEND_API_KEY is missing in environment variables" } };
      }
      return await client.emails.send(payload);
    }
  }
};

module.exports = resend;
const resend = require("../config/resend");

// ======================================================
// CONTACT FORM EMAILS
// ======================================================

// Email to Admin
const sendContactAdminNotification = async (contact) => {
  try {
    const response = await resend.emails.send({
      from: process.env.FROM_EMAIL || "onboarding@resend.dev",
      to: process.env.ADMIN_EMAIL,
      subject: "📩 New Contact Form Submission",
      html: `
        <h2>New Contact Request</h2>

        <p><strong>Name:</strong> ${contact.name}</p>
        <p><strong>Email:</strong> ${contact.email}</p>
        <p><strong>Subject:</strong> ${contact.subject}</p>
        <p><strong>Message:</strong></p>

        <p>${contact.message}</p>
      `,
    });

    if (response?.error) {
      console.error("❌ Contact Admin Email Resend Error:", response.error.message);
    } else {
      console.log("✅ Contact Admin Email Sent (ID:", response?.data?.id, ")");
    }
    return response;
  } catch (error) {
    console.error("❌ Contact Admin Email Unexpected Error:", error);
  }
};

// Thank You Email to User
const sendContactThankYouEmail = async (contact) => {
  try {
    const response = await resend.emails.send({
      from: process.env.FROM_EMAIL || "onboarding@resend.dev",
      to: contact.email,
      subject: "Thank You for Contacting MIDIS",
      html: `
        <h2>Hello ${contact.name},</h2>

        <p>Thank you for contacting MIDIS.</p>

        <p>We have received your message successfully.</p>

        <p>Our team will contact you as soon as possible.</p>

        <br>

        <p>Regards,</p>

        <h3>MIDIS Team</h3>
      `,
    });

    if (response?.error) {
      console.error("❌ Contact User Email Resend Error:", response.error.message);
    } else {
      console.log("✅ Contact User Email Sent (ID:", response?.data?.id, ")");
    }
    return response;
  } catch (error) {
    console.error("❌ Contact User Email Unexpected Error:", error);
  }
};

// ======================================================
// SUBSCRIPTION EMAILS
// ======================================================

// Welcome Email
const sendSubscriptionWelcomeEmail = async (subscriber) => {
  try {
    const response = await resend.emails.send({
      from: process.env.FROM_EMAIL || "onboarding@resend.dev",
      to: subscriber.email,
      subject: "Welcome to MIDIS",
      html: `
        <h2>Hello ${subscriber.fullName},</h2>

        <p>Thank you for subscribing to MIDIS.</p>

        <p>We have received your interest in:</p>

        <h3>${subscriber.domain}</h3>

        <p>Our team will keep you updated.</p>

        <br>

        <p>Regards,</p>

        <h3>MIDIS Team</h3>
      `,
    });

    if (response?.error) {
      console.error("❌ Subscription Welcome Email Resend Error:", response.error.message);
    } else {
      console.log("✅ Subscription Welcome Email Sent (ID:", response?.data?.id, ")");
    }
    return response;
  } catch (error) {
    console.error("❌ Subscription Welcome Email Unexpected Error:", error);
  }
};

// Email to Admin
const sendSubscriptionAdminNotification = async (subscriber) => {
  try {
    const response = await resend.emails.send({
      from: process.env.FROM_EMAIL || "onboarding@resend.dev",
      to: process.env.ADMIN_EMAIL,
      subject: "📩 New Subscription",
      html: `
        <h2>New Subscriber</h2>

        <p><strong>Name:</strong> ${subscriber.fullName}</p>

        <p><strong>Email:</strong> ${subscriber.email}</p>

        <p><strong>Interested Domain:</strong> ${subscriber.domain}</p>
      `,
    });

    if (response?.error) {
      console.error("❌ Subscription Admin Email Resend Error:", response.error.message);
    } else {
      console.log("✅ Subscription Admin Email Sent (ID:", response?.data?.id, ")");
    }
    return response;
  } catch (error) {
    console.error("❌ Subscription Admin Email Unexpected Error:", error);
  }
};

module.exports = {
  sendContactAdminNotification,
  sendContactThankYouEmail,
  sendSubscriptionWelcomeEmail,
  sendSubscriptionAdminNotification,
};
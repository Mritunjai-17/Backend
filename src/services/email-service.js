const resend = require("../config/resend");

// ======================================================
// CONTACT FORM EMAILS
// ======================================================

// Email to Admin
const sendContactAdminNotification = async (contact) => {
  try {
    const adminEmail = process.env.ADMIN_EMAIL;
    if (!adminEmail) {
      console.error("❌ Contact Admin Email Error: ADMIN_EMAIL environment variable is missing.");
      return { error: { message: "ADMIN_EMAIL environment variable is missing" } };
    }

    console.log(`📩 Sending Contact Admin Email to: ${adminEmail}...`);
    const response = await resend.emails.send({
      from: process.env.FROM_EMAIL || "onboarding@resend.dev",
      to: adminEmail,
      subject: "📩 New Contact Form Submission",
      html: `
        <h2>New Contact Request</h2>

        <p><strong>Name:</strong> ${contact.name || contact.fullName || 'N/A'}</p>
        <p><strong>Email:</strong> ${contact.email}</p>
        <p><strong>Subject:</strong> ${contact.subject || 'General Inquiry'}</p>
        <p><strong>Message:</strong></p>

        <p>${contact.message}</p>
      `,
    });

    if (response?.error) {
      console.error("❌ Contact Admin Email Resend Error:", response.error.message || response.error);
    } else {
      console.log("✅ Contact Admin Email Sent (ID:", response?.data?.id, ")");
    }
    return response;
  } catch (error) {
    console.error("❌ Contact Admin Email Unexpected Error:", error);
    return { error: error.message };
  }
};

// Thank You Email to User
const sendContactThankYouEmail = async (contact) => {
  try {
    if (!contact?.email) {
      console.error("❌ Contact User Email Error: Recipient email is missing.");
      return { error: { message: "Recipient email missing" } };
    }

    console.log(`📩 Sending Contact Thank You Email to: ${contact.email}...`);
    const response = await resend.emails.send({
      from: process.env.FROM_EMAIL || "onboarding@resend.dev",
      to: contact.email,
      subject: "Thank You for Contacting MIDIS",
      html: `
        <h2>Hello ${contact.name || contact.fullName || 'Valued Customer'},</h2>

        <p>Thank you for contacting MIDIS.</p>

        <p>We have received your message successfully.</p>

        <p>Our team will contact you as soon as possible.</p>

        <br>

        <p>Regards,</p>

        <h3>MIDIS Team</h3>
      `,
    });

    if (response?.error) {
      console.error("❌ Contact User Email Resend Error:", response.error.message || response.error);
    } else {
      console.log("✅ Contact User Email Sent (ID:", response?.data?.id, ")");
    }
    return response;
  } catch (error) {
    console.error("❌ Contact User Email Unexpected Error:", error);
    return { error: error.message };
  }
};

// ======================================================
// SUBSCRIPTION EMAILS
// ======================================================

// Welcome Email
const sendSubscriptionWelcomeEmail = async (subscriber) => {
  try {
    if (!subscriber?.email) {
      console.error("❌ Subscription Welcome Email Error: Recipient email is missing.");
      return { error: { message: "Recipient email missing" } };
    }

    console.log(`📩 Sending Subscription Welcome Email to: ${subscriber.email}...`);
    const response = await resend.emails.send({
      from: process.env.FROM_EMAIL || "onboarding@resend.dev",
      to: subscriber.email,
      subject: "Welcome to MIDIS",
      html: `
        <h2>Hello ${subscriber.fullName || 'Subscriber'},</h2>

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
      console.error("❌ Subscription Welcome Email Resend Error:", response.error.message || response.error);
    } else {
      console.log("✅ Subscription Welcome Email Sent (ID:", response?.data?.id, ")");
    }
    return response;
  } catch (error) {
    console.error("❌ Subscription Welcome Email Unexpected Error:", error);
    return { error: error.message };
  }
};

// Email to Admin
const sendSubscriptionAdminNotification = async (subscriber) => {
  try {
    const adminEmail = process.env.ADMIN_EMAIL;
    if (!adminEmail) {
      console.error("❌ Subscription Admin Email Error: ADMIN_EMAIL environment variable is missing.");
      return { error: { message: "ADMIN_EMAIL environment variable is missing" } };
    }

    console.log(`📩 Sending Subscription Admin Notification to: ${adminEmail}...`);
    const response = await resend.emails.send({
      from: process.env.FROM_EMAIL || "onboarding@resend.dev",
      to: adminEmail,
      subject: "📩 New Subscription",
      html: `
        <h2>New Subscriber Alert</h2>

        <p><strong>Name:</strong> ${subscriber.fullName || subscriber.name || 'N/A'}</p>

        <p><strong>Email:</strong> ${subscriber.email}</p>

        <p><strong>Interested Domain:</strong> ${subscriber.domain}</p>
      `,
    });

    if (response?.error) {
      console.error("❌ Subscription Admin Email Resend Error:", response.error.message || response.error);
    } else {
      console.log("✅ Subscription Admin Email Sent (ID:", response?.data?.id, ")");
    }
    return response;
  } catch (error) {
    console.error("❌ Subscription Admin Email Unexpected Error:", error);
    return { error: error.message };
  }
};

module.exports = {
  sendContactAdminNotification,
  sendContactThankYouEmail,
  sendSubscriptionWelcomeEmail,
  sendSubscriptionAdminNotification,
};
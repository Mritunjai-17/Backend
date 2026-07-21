const ContactRepository = require("../repository/contact-repository");

const {
  sendContactAdminNotification,
  sendContactThankYouEmail
} = require("./email-service");

class ContactService {
  constructor() {
    this.contactRepository = new ContactRepository();
  }

  async createContact(data) {
    try {
      const contactName = data.fullName || data.name || "Valued Customer";
      const contactService = data.service || data.subject || "General Inquiry";

      if (!data.email || !data.message) {
        throw new Error("Email and message are required.");
      }

      const contact = await this.contactRepository.create({
        fullName: contactName,
        name: contactName,
        email: data.email,
        phone: data.phone || "",
        service: contactService,
        subject: contactService,
        message: data.message,
        status: "New",
        isRead: false,
        isDeleted: false,
      });

      try {
        await sendContactAdminNotification(contact);
      } catch (adminErr) {
        console.error("❌ Failed sending contact admin notification:", adminErr.message || adminErr);
      }

      try {
        await sendContactThankYouEmail(contact);
      } catch (userErr) {
        console.error("❌ Failed sending contact thank you email:", userErr.message || userErr);
      }

      return contact;
    } catch (error) {
      console.error("Error in ContactService - createContact:", error);
      throw error;
    }
  }

  async getContacts(options = {}) {
    try {
      const page = Math.max(1, parseInt(options.page) || 1);
      const limit = Math.max(1, parseInt(options.limit) || 10);
      const skip = (page - 1) * limit;

      const filter = { isDeleted: false };

      if (options.status && options.status !== "All") {
        filter.status = options.status;
      }

      if (options.search) {
        const searchRegex = new RegExp(options.search.trim(), "i");
        filter.$or = [
          { fullName: searchRegex },
          { name: searchRegex },
          { email: searchRegex },
          { service: searchRegex },
          { subject: searchRegex },
          { message: searchRegex },
        ];
      }

      const { data, total } = await this.contactRepository.getAllContacts(
        filter,
        skip,
        limit
      );
      const totalPages = Math.ceil(total / limit);

      return {
        data,
        total,
        totalPages,
        currentPage: page,
        limit,
      };
    } catch (error) {
      console.error("Error in ContactService - getContacts:", error);
      throw error;
    }
  }

  async getContactById(id) {
    try {
      return await this.contactRepository.getById(id);
    } catch (error) {
      console.error("Error in ContactService - getContactById:", error);
      throw error;
    }
  }

  async updateContact(id, updateData) {
    try {
      return await this.contactRepository.update(id, updateData);
    } catch (error) {
      console.error("Error in ContactService - updateContact:", error);
      throw error;
    }
  }

  async deleteContact(id) {
    try {
      return await this.contactRepository.delete(id);
    } catch (error) {
      console.error("Error in ContactService - deleteContact:", error);
      throw error;
    }
  }
}

module.exports = ContactService;

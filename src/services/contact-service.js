const ContactRepository = require("../repository/contact-repository");

class ContactService {
  constructor() {
    this.contactRepository = new ContactRepository();
  }

  async createContact(data) {
    try {
      const { name, email, subject, message } = data;

      if (!name || !email || !subject || !message) {
        throw new Error("Name, email, subject, and message are required.");
      }

      const contact = await this.contactRepository.create({
        name,
        email,
        subject,
        message,
      });

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

      const filter = {};

      if (options.search) {
        const searchRegex = new RegExp(options.search.trim(), "i");
        filter.$or = [
          { name: searchRegex },
          { email: searchRegex },
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

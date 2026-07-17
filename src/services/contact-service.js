const ContactRepository = require('../repository/contact-repository');

class ContactService {
  constructor() {
    this.contactRepository = new ContactRepository();
  }

  async createContact(data) {
    try {
      const contact = await this.contactRepository.create(data);
      return contact;
    } catch (error) {
      console.error("Something went wrong in the contact service: createContact");
      throw error;
    }
  }

  /**
   * Retrieve list of contacts matching optional search queries and filters
   */
  async getContacts(options = {}) {
    try {
      const page = Math.max(1, parseInt(options.page) || 1);
      const limit = Math.max(1, parseInt(options.limit) || 10);
      const skip = (page - 1) * limit;

      const filter = { isDeleted: false }; // Exclude soft-deleted items

      // 1. Filter by Status (e.g. "New", "Replied", "Closed")
      if (options.status && options.status !== 'All') {
        filter.status = options.status;
      }

      // 2. Search Keyword matches Name, Email, Phone, or Service
      if (options.search) {
        const searchRegex = new RegExp(options.search.trim(), 'i');
        filter.$or = [
          { fullName: searchRegex },
          { email: searchRegex },
          { phone: searchRegex },
          { service: searchRegex }
        ];
      }

      const { data, total } = await this.contactRepository.getAllContacts(filter, skip, limit);
      const totalPages = Math.ceil(total / limit);

      return {
        data,
        total,
        totalPages,
        currentPage: page,
        limit
      };
    } catch (error) {
      console.error("Something went wrong in the contact service: getContacts");
      throw error;
    }
  }

  /**
   * Update fields of a contact document (e.g. marking isRead or status)
   */
  async updateContact(id, updateData) {
    try {
      const updatedContact = await this.contactRepository.update(id, updateData);
      return updatedContact;
    } catch (error) {
      console.error("Something went wrong in the contact service: updateContact");
      throw error;
    }
  }

  /**
   * Soft-delete a contact message by setting isDeleted=true
   */
  async softDeleteContact(id) {
    try {
      const deletedContact = await this.contactRepository.update(id, { isDeleted: true });
      return deletedContact;
    } catch (error) {
      console.error("Something went wrong in the contact service: softDeleteContact");
      throw error;
    }
  }
}

module.exports = ContactService;

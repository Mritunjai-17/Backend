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
}

module.exports = ContactService;

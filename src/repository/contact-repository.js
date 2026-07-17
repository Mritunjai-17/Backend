const Contact = require('../models/Contact');
const CrudRepository = require('./crud-repository');

class ContactRepository extends CrudRepository {
  constructor() {
    super(Contact);
  }

  /**
   * Fetch contacts with filters, pagination, and sorting
   */
  async getAllContacts(filter = {}, skip = 0, limit = 10) {
    try {
      const query = this.model.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);
      
      const countQuery = this.model.countDocuments(filter);

      const [data, total] = await Promise.all([query, countQuery]);

      return { data, total };
    } catch (error) {
      console.error("Something went wrong in the contact repository: getAllContacts");
      throw error;
    }
  }
}

module.exports = ContactRepository;

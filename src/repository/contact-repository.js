const Contact = require("../models/Contact");

class ContactRepository {
  async create(data) {
    try {
      const contact = await Contact.create(data);
      return contact;
    } catch (error) {
      console.error("Error creating contact in repository:", error);
      throw error;
    }
  }

  async getById(id) {
    try {
      return await Contact.findById(id);
    } catch (error) {
      console.error("Error finding contact by ID in repository:", error);
      throw error;
    }
  }

  async getAllContacts(filter = {}, skip = 0, limit = 10) {
    try {
      const data = await Contact.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);

      const total = await Contact.countDocuments(filter);
      return { data, total };
    } catch (error) {
      console.error("Error fetching contacts in repository:", error);
      throw error;
    }
  }

  async update(id, updateData) {
    try {
      const updatedContact = await Contact.findByIdAndUpdate(
        id,
        updateData,
        { new: true, runValidators: true }
      );
      return updatedContact;
    } catch (error) {
      console.error("Error updating contact in repository:", error);
      throw error;
    }
  }

  async delete(id) {
    try {
      return await Contact.findByIdAndDelete(id);
    } catch (error) {
      console.error("Error deleting contact in repository:", error);
      throw error;
    }
  }
}

module.exports = ContactRepository;

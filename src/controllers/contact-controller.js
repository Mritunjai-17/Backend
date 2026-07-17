const ContactService = require('../services/contact-service');

const contactService = new ContactService();

/**
 * Handle Contact Form submission from public website
 * @route POST /api/contact
 */
const create = async (req, res) => {
  try {
    const { fullName, email, phone, service, message } = req.body;

    const response = await contactService.createContact({
      fullName,
      email,
      phone,
      service,
      message
    });

    return res.status(201).json({
      success: true,
      message: 'Thank you for contacting us. We will get back to you shortly.',
      data: response
    });
  } catch (error) {
    console.error('Error in contact-controller: create', error);
    return res.status(500).json({
      success: false,
      message: 'Something went wrong while submitting your message.',
      error: error.message
    });
  }
};

/**
 * Fetch contact messages for admin dashboard (paginated, filtered, searchable)
 * @route GET /api/contact
 */
const getAll = async (req, res) => {
  try {
    const response = await contactService.getContacts(req.query);
    return res.status(200).json({
      success: true,
      ...response
    });
  } catch (error) {
    console.error('Error in contact-controller: getAll', error);
    return res.status(500).json({
      success: false,
      message: 'Something went wrong while fetching contact messages.',
      error: error.message
    });
  }
};

/**
 * Update contact fields (e.g. read status, state change)
 * @route PATCH /api/contact/:id
 */
const update = async (req, res) => {
  try {
    const response = await contactService.updateContact(req.params.id, req.body);
    if (!response) {
      return res.status(404).json({
        success: false,
        message: 'Contact message not found.'
      });
    }
    return res.status(200).json({
      success: true,
      message: 'Contact message updated successfully.',
      data: response
    });
  } catch (error) {
    console.error('Error in contact-controller: update', error);
    return res.status(500).json({
      success: false,
      message: 'Something went wrong while updating contact message.',
      error: error.message
    });
  }
};

/**
 * Soft-delete a contact message from the database
 * @route DELETE /api/contact/:id
 */
const deleteContact = async (req, res) => {
  try {
    const response = await contactService.softDeleteContact(req.params.id);
    if (!response) {
      return res.status(404).json({
        success: false,
        message: 'Contact message not found.'
      });
    }
    return res.status(200).json({
      success: true,
      message: 'Contact message deleted successfully.'
    });
  } catch (error) {
    console.error('Error in contact-controller: deleteContact', error);
    return res.status(500).json({
      success: false,
      message: 'Something went wrong while deleting contact message.',
      error: error.message
    });
  }
};

module.exports = {
  create,
  getAll,
  update,
  deleteContact
};

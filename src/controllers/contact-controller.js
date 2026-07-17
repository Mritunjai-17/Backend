const ContactService = require('../services/contact-service');

const contactService = new ContactService();

/**
 * Handle Contact Form submission
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
    console.error('Error in contact-controller:', error);
    return res.status(500).json({
      success: false,
      message: 'Something went wrong while submitting your message.',
      error: error.message
    });
  }
};

module.exports = {
  create
};

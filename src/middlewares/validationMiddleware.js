const sanitizeHtml = require('sanitize-html');

// Helper to escape HTML characters to prevent XSS
const escapeHTML = (str) => {
  if (typeof str !== 'string') return str;
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
};

const validateContactInput = (req, res, next) => {
  const { fullName, email, phone, service, message } = req.body;

  // 1. Trim all inputs
  const trimmedName = typeof fullName === 'string' ? fullName.trim() : '';
  const trimmedEmail = typeof email === 'string' ? email.trim() : '';
  const trimmedPhone = typeof phone === 'string' ? phone.trim() : '';
  const trimmedService = typeof service === 'string' ? service.trim() : '';
  const trimmedMessage = typeof message === 'string' ? message.trim() : '';

  // 2. Validate required fields
  if (!trimmedName) {
    return res.status(400).json({
      success: false,
      error: 'Validation error: Full name is required.'
    });
  }

  if (!trimmedEmail) {
    return res.status(400).json({
      success: false,
      error: 'Validation error: Email address is required.'
    });
  }

  // Email format validation
  const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
  if (!emailRegex.test(trimmedEmail)) {
    return res.status(400).json({
      success: false,
      error: 'Validation error: Please provide a valid email address.'
    });
  }

  if (!trimmedService) {
    return res.status(400).json({
      success: false,
      error: 'Validation error: Service selection is required.'
    });
  }

  const allowedServices = [
    'Web Development',
    'Graphic Designing',
    'Digital Marketing',
    'SEO Optimization',
    'Social Media Management',
    'Content Writing',
    'Brand Identity',
    'Other'
  ];

  if (!allowedServices.includes(trimmedService)) {
    return res.status(400).json({
      success: false,
      error: 'Validation error: Invalid service selected.'
    });
  }

  if (!trimmedMessage) {
    return res.status(400).json({
      success: false,
      error: 'Validation error: Message content is required.'
    });
  }

  // 3. Sanitize inputs and Escape HTML to prevent XSS
  req.body.fullName = escapeHTML(trimmedName);
  req.body.email = trimmedEmail.toLowerCase();
  req.body.phone = escapeHTML(trimmedPhone);
  req.body.service = trimmedService;
  req.body.message = escapeHTML(trimmedMessage);

  next();
};

module.exports = {
  validateContactInput
};

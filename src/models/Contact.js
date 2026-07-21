const mongoose = require('mongoose');

const ContactSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      trim: true,
      default: ''
    },
    name: {
      type: String,
      trim: true,
      default: ''
    },
    email: {
      type: String,
      required: [true, 'Email address is required'],
      trim: true,
      lowercase: true
    },
    phone: {
      type: String,
      trim: true,
      default: ''
    },
    service: {
      type: String,
      default: 'General Inquiry'
    },
    subject: {
      type: String,
      default: 'General Inquiry'
    },
    message: {
      type: String,
      required: [true, 'Message content is required'],
      trim: true
    },
    status: {
      type: String,
      default: 'New'
    },
    isRead: {
      type: Boolean,
      default: false
    },
    isDeleted: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.models.Contact || mongoose.model('Contact', ContactSchema);


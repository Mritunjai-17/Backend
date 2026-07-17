const mongoose = require('mongoose');

const ContactSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: [true, 'Full name is required'],
      trim: true
    },
    email: {
      type: String,
      required: [true, 'Email address is required'],
      trim: true,
      lowercase: true,
      match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email address']
    },
    phone: {
      type: String,
      trim: true,
      default: ''
    },
    service: {
      type: String,
      required: [true, 'Service selection is required'],
      enum: {
        values: [
          'Web Development',
          'Graphic Designing',
          'Digital Marketing',
          'SEO Optimization',
          'Social Media Management',
          'Content Writing',
          'Brand Identity',
          'Other'
        ],
        message: 'Invalid service selected'
      }
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

module.exports = mongoose.model('Contact', ContactSchema);

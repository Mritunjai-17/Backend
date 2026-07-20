const mongoose = require('mongoose');

const SubscriptionSchema = new mongoose.Schema(
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
    domain: {
      type: String,
      required: [true, 'Service domain selection is required'],
      trim: true
    },
    status: {
      type: String,
      enum: ['Active', 'Contacted', 'Unsubscribed'],
      default: 'Active'
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

// Search indexing for fast queries
SubscriptionSchema.index({ fullName: 'text', email: 'text', domain: 'text' });

module.exports = mongoose.model('Subscription', SubscriptionSchema);

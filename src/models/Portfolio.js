const mongoose = require('mongoose');

const PortfolioSchema = new mongoose.Schema({
  imageUrl: {
    type: String,
    required: [true, 'Portfolio image or file path is required']
  },
  fileType: {
    type: String,
    enum: ['image', 'pdf'],
    default: 'image'
  }
}, { 
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for 'image' property compatibility
PortfolioSchema.virtual('image').get(function() {
  return this.imageUrl;
});

module.exports = mongoose.model('Portfolio', PortfolioSchema);

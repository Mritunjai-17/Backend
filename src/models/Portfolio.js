const mongoose = require('mongoose');

const PortfolioSchema = new mongoose.Schema({
  imageUrl: {
    type: String,
    required: [true, 'Portfolio image path is required']
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

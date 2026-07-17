const mongoose = require('mongoose');

const PortfolioSchema = new mongoose.Schema({
  imageUrl: {
    type: String,
    required: [true, 'Portfolio image URL is required']
  }
}, { timestamps: true });

module.exports = mongoose.model('Portfolio', PortfolioSchema);

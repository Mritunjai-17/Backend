const fs = require('fs');
const path = require('path');
const Portfolio = require('../models/Portfolio');

/**
 * @desc    Get the current single portfolio image
 * @route   GET /api/portfolio
 * @access  Public
 */
exports.getPortfolio = async (req, res) => {
  try {
    const portfolio = await Portfolio.findOne();
    if (!portfolio) {
      // Fallback default image URL matching the original hardcoded one
      return res.status(200).json({
        success: true,
        data: {
          imageUrl: '/MIDIS/71c06f41f9f6c6715b4de3690ed53236 copy.webp',
          updatedAt: new Date()
        }
      });
    }
    res.status(200).json({
      success: true,
      data: portfolio
    });
  } catch (err) {
    console.error('Error in portfolioController: getPortfolio', err);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch portfolio image.'
    });
  }
};

/**
 * @desc    Update the portfolio image URL
 * @route   PUT /api/portfolio/image
 * @access  Private (Approved Admin only)
 */
exports.updatePortfolioImage = async (req, res) => {
  const { imageUrl } = req.body;

  if (!imageUrl) {
    return res.status(400).json({
      success: false,
      error: 'Image URL is required.'
    });
  }

  try {
    let portfolio = await Portfolio.findOne();
    if (portfolio) {
      portfolio.imageUrl = imageUrl;
      await portfolio.save();
    } else {
      portfolio = await Portfolio.create({ imageUrl });
    }

    res.status(200).json({
      success: true,
      message: 'Portfolio image URL updated successfully.',
      data: portfolio
    });
  } catch (err) {
    console.error('Error in portfolioController: updatePortfolioImage', err);
    res.status(500).json({
      success: false,
      error: 'Failed to update portfolio image.'
    });
  }
};

/**
 * @desc    Delete the portfolio image (reverts to default)
 * @route   DELETE /api/portfolio/image
 * @access  Private (Approved Admin only)
 */
exports.deletePortfolioImage = async (req, res) => {
  try {
    const portfolio = await Portfolio.findOne();
    if (!portfolio) {
      return res.status(444).json({
        success: false,
        error: 'Portfolio image registration not found.'
      });
    }

    // Delete the file from local disk if it was uploaded locally
    if (portfolio.imageUrl && portfolio.imageUrl.startsWith('/uploads/portfolio/')) {
      const filePath = path.join(__dirname, '../..', portfolio.imageUrl);
      if (fs.existsSync(filePath)) {
        try {
          fs.unlinkSync(filePath);
          console.log(`Deleted portfolio image file: ${filePath}`);
        } catch (unlinkErr) {
          console.error(`Error unlinking portfolio image file: ${unlinkErr.message}`);
        }
      }
    }

    // Remove the document so GET requests fall back to the default hardcoded placeholder
    await Portfolio.deleteOne({ _id: portfolio._id });

    res.status(200).json({
      success: true,
      message: 'Portfolio image deleted successfully. Reverted to default placeholder.'
    });
  } catch (err) {
    console.error('Error in portfolioController: deletePortfolioImage', err);
    res.status(500).json({
      success: false,
      error: 'Failed to delete portfolio image.'
    });
  }
};

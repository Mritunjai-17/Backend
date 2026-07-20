const PortfolioService = require('../services/portfolio-service');
const portfolioService = new PortfolioService();

/**
 * @desc    Get current portfolio document or default fallback
 * @route   GET /api/portfolio
 * @access  Public
 */
exports.getPortfolio = async (req, res) => {
  try {
    const portfolio = await portfolioService.getPortfolio();
    res.status(200).json({
      success: true,
      data: portfolio
    });
  } catch (err) {
    console.error('Error in portfolioController: getPortfolio', err);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch portfolio data.'
    });
  }
};

/**
 * @desc    Update or upload portfolio file/image
 * @route   PUT /api/portfolio/image or POST /api/portfolio
 * @access  Private (Approved Admin only)
 */
exports.updatePortfolioImage = async (req, res) => {
  try {
    let filePath = req.body.imageUrl || req.body.image;
    
    if (req.file) {
      filePath = `/uploads/portfolio/${req.file.filename}`;
    }

    if (!filePath) {
      return res.status(400).json({
        success: false,
        error: 'File or imageUrl is required.'
      });
    }

    const portfolio = await portfolioService.updatePortfolio(filePath);

    res.status(200).json({
      success: true,
      message: 'Portfolio updated successfully.',
      data: portfolio
    });
  } catch (err) {
    console.error('Error in portfolioController: updatePortfolioImage', err);
    res.status(500).json({
      success: false,
      error: err.message || 'Failed to update portfolio image.'
    });
  }
};

/**
 * @desc    Delete the portfolio image/document (reverts to default)
 * @route   DELETE /api/portfolio/image
 * @access  Private (Approved Admin only)
 */
exports.deletePortfolioImage = async (req, res) => {
  try {
    const result = await portfolioService.deletePortfolio();

    if (!result) {
      return res.status(404).json({
        success: false,
        error: 'Portfolio item not found.'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Portfolio deleted successfully. Reverted to default placeholder.'
    });
  } catch (err) {
    console.error('Error in portfolioController: deletePortfolioImage', err);
    res.status(500).json({
      success: false,
      error: 'Failed to delete portfolio image.'
    });
  }
};

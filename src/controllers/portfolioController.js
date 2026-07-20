const PortfolioService = require('../services/portfolio-service');
const portfolioService = new PortfolioService();

/**
 * @desc    Get all portfolio items
 * @route   GET /api/portfolio
 * @access  Public
 */
exports.getPortfolio = async (req, res) => {
  try {
    const portfolios = await portfolioService.getAllPortfolios();
    res.status(200).json({
      success: true,
      data: portfolios
    });
  } catch (err) {
    console.error('Error in portfolioController: getPortfolio', err);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch portfolio gallery.'
    });
  }
};

/**
 * @desc    Upload / create a new portfolio image entry
 * @route   POST /api/portfolio/image or POST /api/portfolio
 * @access  Private (Approved Admin only)
 */
exports.createPortfolioImage = async (req, res) => {
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

    const portfolio = await portfolioService.createPortfolio(filePath);

    res.status(201).json({
      success: true,
      message: 'Portfolio image added successfully.',
      data: portfolio
    });
  } catch (err) {
    console.error('Error in portfolioController: createPortfolioImage', err);
    res.status(500).json({
      success: false,
      error: err.message || 'Failed to add portfolio image.'
    });
  }
};

/**
 * @desc    Delete a single portfolio image by ID
 * @route   DELETE /api/portfolio/:id or DELETE /api/portfolio/image/:id
 * @access  Private (Approved Admin only)
 */
exports.deletePortfolioImage = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        error: 'Portfolio item ID is required.'
      });
    }

    const result = await portfolioService.deletePortfolio(id);

    if (!result) {
      return res.status(404).json({
        success: false,
        error: 'Portfolio item not found.'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Portfolio image deleted successfully.'
    });
  } catch (err) {
    console.error('Error in portfolioController: deletePortfolioImage', err);
    res.status(500).json({
      success: false,
      error: 'Failed to delete portfolio image.'
    });
  }
};

// Aliases for compatibility
exports.updatePortfolioImage = exports.createPortfolioImage;

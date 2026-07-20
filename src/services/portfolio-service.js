const fs = require('fs');
const path = require('path');
const PortfolioRepository = require('../repository/portfolio-repository');

class PortfolioService {
  constructor() {
    this.portfolioRepository = new PortfolioRepository();
  }

  /**
   * Unlink a specific file from disk if it exists under uploads/portfolio/
   */
  async deleteLocalFile(relativePath) {
    if (relativePath && relativePath.startsWith('/uploads/portfolio/')) {
      const absolutePath = path.join(__dirname, '../../', relativePath);
      if (fs.existsSync(absolutePath)) {
        try {
          fs.unlinkSync(absolutePath);
          console.log(`Successfully deleted portfolio image file: ${absolutePath}`);
        } catch (unlinkErr) {
          console.error(`Failed to delete portfolio image file (${absolutePath}): ${unlinkErr.message}`);
        }
      }
    }
  }

  /**
   * Get all portfolio items
   */
  async getAllPortfolios() {
    try {
      const portfolios = await this.portfolioRepository.getAll();
      return portfolios;
    } catch (error) {
      console.error("Something went wrong in PortfolioService: getAllPortfolios", error);
      throw error;
    }
  }

  /**
   * Add a new portfolio image item
   */
  async createPortfolio(imageUrl) {
    try {
      if (!imageUrl) {
        throw new Error('Image path is required');
      }

      const newPortfolio = await this.portfolioRepository.create({ imageUrl });
      return newPortfolio;
    } catch (error) {
      console.error("Something went wrong in PortfolioService: createPortfolio", error);
      throw error;
    }
  }

  /**
   * Delete a single portfolio item by ID and remove its image from disk
   */
  async deletePortfolio(id) {
    try {
      const existing = await this.portfolioRepository.get(id);
      if (!existing) {
        return null;
      }

      // Unlink image file from disk if stored locally
      if (existing.imageUrl) {
        await this.deleteLocalFile(existing.imageUrl);
      }

      const deletedItem = await this.portfolioRepository.destroy(id);
      return deletedItem;
    } catch (error) {
      console.error("Something went wrong in PortfolioService: deletePortfolio", error);
      throw error;
    }
  }
}

module.exports = PortfolioService;

const fs = require('fs');
const path = require('path');
const PortfolioRepository = require('../repository/portfolio-repository');

class PortfolioService {
  constructor() {
    this.portfolioRepository = new PortfolioRepository();
  }

  /**
   * Remove a local uploaded file from disk if it exists in uploads/portfolio/
   */
  async deleteLocalFile(relativePath) {
    if (relativePath && relativePath.startsWith('/uploads/portfolio/')) {
      const absolutePath = path.join(__dirname, '../../', relativePath);
      if (fs.existsSync(absolutePath)) {
        try {
          fs.unlinkSync(absolutePath);
          console.log(`Successfully deleted old portfolio file: ${absolutePath}`);
        } catch (unlinkErr) {
          console.error(`Failed to delete portfolio file (${absolutePath}): ${unlinkErr.message}`);
        }
      }
    }
  }

  /**
   * Determine file type ('image' or 'pdf') based on file extension
   */
  getFileType(filePath) {
    if (!filePath) return 'image';
    return filePath.toLowerCase().endsWith('.pdf') ? 'pdf' : 'image';
  }

  /**
   * Get the current portfolio document or default fallback
   */
  async getPortfolio() {
    try {
      const portfolio = await this.portfolioRepository.getPortfolio();
      if (!portfolio) {
        return {
          imageUrl: '/MIDIS/71c06f41f9f6c6715b4de3690ed53236 copy.webp',
          image: '/MIDIS/71c06f41f9f6c6715b4de3690ed53236 copy.webp',
          fileType: 'image',
          updatedAt: new Date()
        };
      }
      return portfolio;
    } catch (error) {
      console.error("Something went wrong in PortfolioService: getPortfolio", error);
      throw error;
    }
  }

  /**
   * Update portfolio with new file path or image URL, deleting the old file automatically
   */
  async updatePortfolio(imageUrl) {
    try {
      if (!imageUrl) {
        throw new Error('Image URL / file path is required');
      }

      // Check existing document to clean up old uploaded file
      const existing = await this.portfolioRepository.getPortfolio();
      if (existing && existing.imageUrl && existing.imageUrl !== imageUrl) {
        await this.deleteLocalFile(existing.imageUrl);
      }

      const fileType = this.getFileType(imageUrl);
      const updatedPortfolio = await this.portfolioRepository.upsertPortfolio({
        imageUrl,
        fileType
      });

      return updatedPortfolio;
    } catch (error) {
      console.error("Something went wrong in PortfolioService: updatePortfolio", error);
      throw error;
    }
  }

  /**
   * Delete custom portfolio entry and clean up file on disk
   */
  async deletePortfolio() {
    try {
      const existing = await this.portfolioRepository.getPortfolio();
      if (!existing) {
        return null;
      }

      if (existing.imageUrl) {
        await this.deleteLocalFile(existing.imageUrl);
      }

      await this.portfolioRepository.deletePortfolio();
      return true;
    } catch (error) {
      console.error("Something went wrong in PortfolioService: deletePortfolio", error);
      throw error;
    }
  }
}

module.exports = PortfolioService;

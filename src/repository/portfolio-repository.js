const Portfolio = require('../models/Portfolio');
const CrudRepository = require('./crud-repository');

class PortfolioRepository extends CrudRepository {
  constructor() {
    super(Portfolio);
  }

  // Get all portfolio items sorted by newest first
  async getAll() {
    try {
      const portfolios = await this.model.find({}).sort({ createdAt: -1 });
      return portfolios;
    } catch (error) {
      console.error("Something went wrong in the portfolio repository: getAll", error);
      throw error;
    }
  }

  // Create a new portfolio item document
  async create(data) {
    try {
      const portfolio = await this.model.create(data);
      return portfolio;
    } catch (error) {
      console.error("Something went wrong in the portfolio repository: create", error);
      throw error;
    }
  }

  // Find single portfolio item by ID
  async get(id) {
    try {
      const portfolio = await this.model.findById(id);
      return portfolio;
    } catch (error) {
      console.error("Something went wrong in the portfolio repository: get", error);
      throw error;
    }
  }

  // Delete portfolio item by ID
  async destroy(id) {
    try {
      const result = await this.model.findByIdAndDelete(id);
      return result;
    } catch (error) {
      console.error("Something went wrong in the portfolio repository: destroy", error);
      throw error;
    }
  }
}

module.exports = PortfolioRepository;

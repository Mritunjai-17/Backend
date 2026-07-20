const Portfolio = require('../models/Portfolio');
const CrudRepository = require('./crud-repository');

class PortfolioRepository extends CrudRepository {
  constructor() {
    super(Portfolio);
  }

  async getPortfolio() {
    try {
      const portfolio = await this.model.findOne();
      return portfolio;
    } catch (error) {
      console.error("Something went wrong in the portfolio repository: getPortfolio", error);
      throw error;
    }
  }

  async upsertPortfolio(data) {
    try {
      let portfolio = await this.model.findOne();
      if (portfolio) {
        portfolio.imageUrl = data.imageUrl;
        if (data.fileType) {
          portfolio.fileType = data.fileType;
        }
        await portfolio.save();
      } else {
        portfolio = await this.model.create(data);
      }
      return portfolio;
    } catch (error) {
      console.error("Something went wrong in the portfolio repository: upsertPortfolio", error);
      throw error;
    }
  }

  async deletePortfolio() {
    try {
      const portfolio = await this.model.findOne();
      if (portfolio) {
        await this.model.deleteOne({ _id: portfolio._id });
      }
      return portfolio;
    } catch (error) {
      console.error("Something went wrong in the portfolio repository: deletePortfolio", error);
      throw error;
    }
  }
}

module.exports = PortfolioRepository;

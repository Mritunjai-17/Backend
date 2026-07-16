const Blog = require('../models/Blog');
const CrudRepository = require('./crud-repository');

class BlogRepository extends CrudRepository {
  constructor() {
    super(Blog);
  }

  // Override to get blogs sorted by newest first
  async getAll() {
    try {
      const result = await this.model.find({}).sort({ createdAt: -1 });
      return result;
    } catch (error) {
      console.error("Something went wrong in the blog repository: getAll");
      throw error;
    }
  }
}

module.exports = BlogRepository;

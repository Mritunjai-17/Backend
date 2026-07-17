const mongoose = require('mongoose');
const Blog = require('../models/Blog');
const CrudRepository = require('./crud-repository');

class BlogRepository extends CrudRepository {
  constructor() {
    super(Blog);
  }

  // Override to find by ID or Slug
  async get(idOrSlug) {
    try {
      let result;
      if (mongoose.Types.ObjectId.isValid(idOrSlug)) {
        result = await this.model.findById(idOrSlug);
      } else {
        result = await this.model.findOne({ slug: idOrSlug });
      }
      return result;
    } catch (error) {
      console.error("Something went wrong in the blog repository: get");
      throw error;
    }
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

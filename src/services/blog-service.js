const BlogRepository = require('../repository/blog-repository');

class BlogService {
  constructor() {
    this.blogRepository = new BlogRepository();
  }

  async createBlog(data) {
    try {
      const blog = await this.blogRepository.create(data);
      return blog;
    } catch (error) {
      console.error("Something went wrong in the blog service: createBlog");
      throw error;
    }
  }

  async deleteBlog(id) {
    try {
      const response = await this.blogRepository.destroy(id);
      return response;
    } catch (error) {
      console.error("Something went wrong in the blog service: deleteBlog");
      throw error;
    }
  }

  async getBlog(id) {
    try {
      const blog = await this.blogRepository.get(id);
      return blog;
    } catch (error) {
      console.error("Something went wrong in the blog service: getBlog");
      throw error;
    }
  }

  async getAllBlogs() {
    try {
      const blogs = await this.blogRepository.getAll();
      return blogs;
    } catch (error) {
      console.error("Something went wrong in the blog service: getAllBlogs");
      throw error;
    }
  }

  async updateBlog(id, data) {
    try {
      // Find blog and call save to trigger the slugify pre-save hooks
      const blog = await this.blogRepository.get(id);
      if (!blog) return null;

      if (data.title !== undefined) blog.title = data.title;
      if (data.content !== undefined) blog.content = data.content;
      if (data.coverImage !== undefined) blog.coverImage = data.coverImage;
      if (data.excerpt !== undefined) blog.excerpt = data.excerpt;
      if (data.category !== undefined) blog.category = data.category;
      if (data.author !== undefined) blog.author = data.author;
      if (data.tags !== undefined) blog.tags = data.tags;
      if (data.status !== undefined) blog.status = data.status;
      if (data.publishedAt !== undefined) blog.publishedAt = data.publishedAt;

      await blog.save();
      return blog;
    } catch (error) {
      console.error("Something went wrong in the blog service: updateBlog");
      throw error;
    }
  }
}

module.exports = BlogService;

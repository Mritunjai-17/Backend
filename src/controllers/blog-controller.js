const BlogService = require('../services/blog-service');

const blogService = new BlogService();

const create = async (req, res) => {
  const { title, content, coverImage } = req.body;

  if (!title || !content) {
    return res.status(400).json({
      success: false,
      message: 'Please provide both title and content',
      data: {},
      err: 'Validation error: title or content missing'
    });
  }

  try {
    const response = await blogService.createBlog({ title, content, coverImage });
    return res.status(201).json({
      success: true,
      message: 'Successfully created a blog',
      data: response,
      err: {}
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Not able to create a blog',
      data: {},
      err: error.message
    });
  }
};

const destroy = async (req, res) => {
  try {
    const response = await blogService.deleteBlog(req.params.id);
    if (!response) {
      return res.status(404).json({
        success: false,
        message: 'Blog not found',
        data: {},
        err: 'No blog matching ID found'
      });
    }
    return res.status(200).json({
      success: true,
      message: 'Successfully deleted the blog',
      data: response,
      err: {}
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Not able to delete the blog',
      data: {},
      err: error.message
    });
  }
};

const get = async (req, res) => {
  try {
    const response = await blogService.getBlog(req.params.id);
    if (!response) {
      return res.status(404).json({
        success: false,
        message: 'Blog not found',
        data: {},
        err: 'No blog matching ID found'
      });
    }
    return res.status(200).json({
      success: true,
      message: 'Successfully fetched the blog',
      data: response,
      err: {}
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Not able to fetch the blog',
      data: {},
      err: error.message
    });
  }
};

const getAll = async (req, res) => {
  try {
    const response = await blogService.getAllBlogs();
    return res.status(200).json({
      success: true,
      message: 'Successfully fetched all blogs',
      data: response,
      err: {}
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Not able to fetch all blogs',
      data: {},
      err: error.message
    });
  }
};

const update = async (req, res) => {
  try {
    const response = await blogService.updateBlog(req.params.id, req.body);
    if (!response) {
      return res.status(404).json({
        success: false,
        message: 'Blog not found',
        data: {},
        err: 'No blog matching ID found'
      });
    }
    return res.status(200).json({
      success: true,
      message: 'Successfully updated the blog',
      data: response,
      err: {}
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Not able to update the blog',
      data: {},
      err: error.message
    });
  }
};

module.exports = {
  create,
  destroy,
  get,
  getAll,
  update
};

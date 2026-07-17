const mongoose = require('mongoose');
const sanitizeHtml = require('sanitize-html');
const BlogService = require('../services/blog-service');

const blogService = new BlogService();

const OFFLINE_BLOG = {
  _id: 'offline-blog-1',
  title: 'Welcome to Midis CMS (Offline Mode)',
  content: 'You are currently running the CMS in Standalone Offline Mode. Connect to MongoDB Atlas or a local MongoDB instance to enable persistent storage and manage blog posts.',
  coverImage: 'https://images.unsplash.com/photo-1499750310107-5fef28a66643',
  slug: 'welcome-to-midis-cms-offline',
  createdAt: new Date('2026-07-17T00:00:00.000Z').toISOString(),
  updatedAt: new Date('2026-07-17T00:00:00.000Z').toISOString()
};

// HTML Sanitizer to prevent XSS while preserving rich formatting
const sanitizeBlogContent = (html) => {
  if (!html) return '';
  return sanitizeHtml(html, {
    allowedTags: sanitizeHtml.defaults.allowedTags.concat([
      'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'img', 'hr', 'u', 'span', 'div', 'pre', 'code', 'table', 'thead', 'tbody', 'tr', 'th', 'td'
    ]),
    allowedAttributes: {
      a: ['href', 'name', 'target', 'rel'],
      img: ['src', 'alt', 'title', 'width', 'height', 'style', 'class', 'srcset'],
      '*': ['class', 'style', 'id']
    },
    allowedStyles: {
      '*': {
        // Allow all style properties to preserve CKEditor and MS Word formatting
        '*': [/.*/]
      }
    }
  });
};

const create = async (req, res) => {
  const isDBConnected = mongoose.connection.readyState === 1;
  if (!isDBConnected) {
    return res.status(503).json({
      success: false,
      message: 'Database is offline. Blog creation is disabled in Offline Mode.',
      data: {},
      err: 'Service Unavailable (Offline Mode)'
    });
  }

  const { title, content, coverImage, excerpt, category, author, tags, status, publishedAt } = req.body;

  if (!title || !content) {
    return res.status(400).json({
      success: false,
      message: 'Please provide both title and content',
      data: {},
      err: 'Validation error: title or content missing'
    });
  }

  try {
    const sanitizedContent = sanitizeBlogContent(content);
    const response = await blogService.createBlog({
      title,
      content: sanitizedContent,
      coverImage,
      excerpt,
      category,
      author,
      tags,
      status,
      publishedAt
    });
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
  const isDBConnected = mongoose.connection.readyState === 1;
  if (!isDBConnected) {
    return res.status(503).json({
      success: false,
      message: 'Database is offline. Blog deletion is disabled in Offline Mode.',
      data: {},
      err: 'Service Unavailable (Offline Mode)'
    });
  }

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
  const isDBConnected = mongoose.connection.readyState === 1;
  if (!isDBConnected) {
    if (req.params.id === 'offline-blog-1') {
      return res.status(200).json({
        success: true,
        message: 'Successfully fetched the offline fallback blog',
        data: OFFLINE_BLOG,
        err: {}
      });
    }
    return res.status(404).json({
      success: false,
      message: 'Blog not found',
      data: {},
      err: 'Database is offline and requested blog does not exist'
    });
  }

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
  const isDBConnected = mongoose.connection.readyState === 1;
  if (!isDBConnected) {
    return res.status(200).json({
      success: true,
      message: 'Successfully fetched offline fallback blogs (Offline Mode)',
      data: [OFFLINE_BLOG],
      err: {}
    });
  }

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
  const isDBConnected = mongoose.connection.readyState === 1;
  if (!isDBConnected) {
    return res.status(503).json({
      success: false,
      message: 'Database is offline. Blog updates are disabled in Offline Mode.',
      data: {},
      err: 'Service Unavailable (Offline Mode)'
    });
  }

  try {
    const updateData = { ...req.body };
    if (updateData.content !== undefined) {
      updateData.content = sanitizeBlogContent(updateData.content);
    }
    const response = await blogService.updateBlog(req.params.id, updateData);
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


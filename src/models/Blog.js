const mongoose = require('mongoose');

const BlogSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please provide a blog title'],
      trim: true
    },
    content: {
      type: String,
      required: [true, 'Please provide the blog content']
    },
    coverImage: {
      type: String,
      default: ''
    },
    slug: {
      type: String,
      unique: true
    },
    excerpt: {
      type: String,
      default: ''
    },
    category: {
      type: String,
      default: ''
    },
    author: {
      type: String,
      default: ''
    },
    tags: {
      type: [String],
      default: []
    },
    status: {
      type: String,
      enum: ['draft', 'published'],
      default: 'draft'
    },
    publishedAt: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: true
  }
);

// Auto-generate slug from title before saving
BlogSchema.pre('save', async function (next) {
  if (!this.isModified('title')) {
    return next();
  }

  // Basic slugify
  let generatedSlug = this.title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')    // Remove special characters
    .replace(/[\s_]+/g, '-')          // Replace spaces/underscores with hyphens
    .replace(/-+/g, '-');             // Collapse multiple hyphens

  // Ensure slug is not empty
  if (!generatedSlug) {
    generatedSlug = 'blog-' + Math.random().toString(36).substring(2, 8);
  }

  // Handle unique slug collisions by appending short ID if duplicate exists
  try {
    const Blog = mongoose.model('Blog');
    let slugExists = await Blog.findOne({ slug: generatedSlug });
    let counter = 1;
    let finalSlug = generatedSlug;
    
    while (slugExists && slugExists._id.toString() !== this._id.toString()) {
      finalSlug = `${generatedSlug}-${counter}`;
      slugExists = await Blog.findOne({ slug: finalSlug });
      counter++;
    }
    this.slug = finalSlug;
    next();
  } catch (err) {
    this.slug = generatedSlug;
    next();
  }
});

module.exports = mongoose.model('Blog', BlogSchema);

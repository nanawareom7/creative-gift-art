const mongoose = require('mongoose');

const blogSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Blog title is required'],
      trim: true,
    },
    slug: {
      type: String,
      required: [true, 'Blog slug is required'],
      unique: true,
      trim: true,
      lowercase: true,
    },
    excerpt: {
      type: String,
      default: '',
      trim: true,
    },
    content: {
      type: String,
      required: [true, 'Blog content is required'],
    },
    category: {
      type: String,
      default: 'General',
      trim: true,
    },
    author: {
      type: String,
      default: 'Creative Gift Art',
      trim: true,
    },
    status: {
      type: String,
      enum: ['draft', 'published'],
      default: 'draft',
    },
    publishedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Index for query optimization
blogSchema.index({ status: 1, publishedAt: -1 });
blogSchema.index({ slug: 1 });

module.exports = mongoose.model('Blog', blogSchema);

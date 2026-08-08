const { validationResult } = require('express-validator');
const Blog = require('../models/Blog');
const { generateUniqueSlug } = require('../utils/slugGenerator');
const { sendSuccess, sendError } = require('../utils/apiResponse');

/**
 * @desc    Get all published blogs
 * @route   GET /api/blogs
 * @access  Public
 */
const getPublishedBlogs = async (req, res, next) => {
  try {
    const { category, search } = req.query;

    const filter = { status: 'published' };

    if (category && category !== 'all') {
      filter.category = { $regex: new RegExp(`^${category}$`, 'i') };
    }

    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { excerpt: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } },
      ];
    }

    const blogs = await Blog.find(filter)
      .sort({ publishedAt: -1, createdAt: -1 })
      .lean();

    return sendSuccess(res, 200, 'Published blogs retrieved successfully', {
      count: blogs.length,
      blogs,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get single published blog by slug
 * @route   GET /api/blogs/:slug
 * @access  Public
 */
const getPublishedBlogBySlug = async (req, res, next) => {
  try {
    const { slug } = req.params;

    const blog = await Blog.findOne({ slug, status: 'published' });

    if (!blog) {
      return sendError(res, 404, 'Blog post not found');
    }

    return sendSuccess(res, 200, 'Blog post retrieved successfully', { blog });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all blogs (including drafts) for admin
 * @route   GET /api/blogs/admin
 * @access  Private (Admin)
 */
const getAllBlogsAdmin = async (req, res, next) => {
  try {
    const { status, search } = req.query;

    const filter = {};

    if (status && ['draft', 'published'].includes(status)) {
      filter.status = status;
    }

    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { excerpt: { $regex: search, $options: 'i' } },
        { category: { $regex: search, $options: 'i' } },
        { author: { $regex: search, $options: 'i' } },
      ];
    }

    const blogs = await Blog.find(filter)
      .sort({ createdAt: -1 })
      .lean();

    return sendSuccess(res, 200, 'All blogs retrieved successfully', {
      count: blogs.length,
      blogs,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Create a new blog post
 * @route   POST /api/blogs
 * @access  Private (Admin)
 */
const createBlog = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return sendError(res, 400, 'Validation failed', errors.array());
    }

    const { title, slug, excerpt, content, category, author, status } = req.body;

    const rawSlugText = slug || title;
    const finalSlug = await generateUniqueSlug(rawSlugText, Blog);

    const blogStatus = status === 'published' ? 'published' : 'draft';
    const publishedAt = blogStatus === 'published' ? new Date() : null;

    const blog = await Blog.create({
      title,
      slug: finalSlug,
      excerpt: excerpt || '',
      content,
      category: category || 'General',
      author: author || 'Creative Gift Art',
      status: blogStatus,
      publishedAt,
    });

    return sendSuccess(res, 201, 'Blog post created successfully', { blog });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update an existing blog post
 * @route   PUT /api/blogs/:id
 * @access  Private (Admin)
 */
const updateBlog = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return sendError(res, 400, 'Validation failed', errors.array());
    }

    const blog = await Blog.findById(req.params.id);
    if (!blog) {
      return sendError(res, 404, 'Blog post not found');
    }

    const { title, slug, excerpt, content, category, author, status } = req.body;

    if (title && title !== blog.title) {
      blog.title = title;
    }

    if (slug || (title && title !== blog.title)) {
      const rawSlugText = slug || blog.title;
      blog.slug = await generateUniqueSlug(rawSlugText, Blog, blog._id);
    }

    if (excerpt !== undefined) blog.excerpt = excerpt;
    if (content !== undefined) blog.content = content;
    if (category !== undefined) blog.category = category;
    if (author !== undefined) blog.author = author;

    if (status !== undefined && status !== blog.status) {
      blog.status = status;
      if (status === 'published' && !blog.publishedAt) {
        blog.publishedAt = new Date();
      }
    }

    await blog.save();

    return sendSuccess(res, 200, 'Blog post updated successfully', { blog });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete a blog post
 * @route   DELETE /api/blogs/:id
 * @access  Private (Admin)
 */
const deleteBlog = async (req, res, next) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) {
      return sendError(res, 404, 'Blog post not found');
    }

    await blog.deleteOne();

    return sendSuccess(res, 200, 'Blog post deleted successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Publish / Unpublish a blog post
 * @route   PUT /api/blogs/:id/publish
 * @access  Private (Admin)
 */
const togglePublishBlog = async (req, res, next) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) {
      return sendError(res, 404, 'Blog post not found');
    }

    const requestedStatus = req.body.status;
    let newStatus;

    if (requestedStatus && ['draft', 'published'].includes(requestedStatus)) {
      newStatus = requestedStatus;
    } else {
      newStatus = blog.status === 'published' ? 'draft' : 'published';
    }

    blog.status = newStatus;
    if (newStatus === 'published' && !blog.publishedAt) {
      blog.publishedAt = new Date();
    }

    await blog.save();

    return sendSuccess(
      res,
      200,
      `Blog post ${newStatus === 'published' ? 'published' : 'saved as draft'} successfully`,
      { blog }
    );
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getPublishedBlogs,
  getPublishedBlogBySlug,
  getAllBlogsAdmin,
  createBlog,
  updateBlog,
  deleteBlog,
  togglePublishBlog,
};

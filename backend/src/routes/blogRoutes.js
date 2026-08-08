const express = require('express');
const router = express.Router();
const {
  getPublishedBlogs,
  getPublishedBlogBySlug,
  getAllBlogsAdmin,
  createBlog,
  updateBlog,
  deleteBlog,
  togglePublishBlog,
} = require('../controllers/blogController');
const { protect } = require('../middleware/authMiddleware');
const { blogValidationRules } = require('../validators/blogValidator');

// Public routes
router.get('/', getPublishedBlogs);
router.get('/admin', protect, getAllBlogsAdmin);
router.get('/:slug', getPublishedBlogBySlug);

// Protected admin routes
router.post('/', protect, blogValidationRules, createBlog);
router.put('/:id', protect, blogValidationRules, updateBlog);
router.delete('/:id', protect, deleteBlog);
router.put('/:id/publish', protect, togglePublishBlog);

module.exports = router;

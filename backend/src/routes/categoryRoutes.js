const express = require('express');
const router = express.Router();
const {
  createCategory,
  getCategories,
  getCategoriesByService,
  getCategory,
  updateCategory,
  deleteCategory,
} = require('../controllers/categoryController');
const { protect } = require('../middleware/authMiddleware');
const {
  createCategoryValidator,
  updateCategoryValidator,
} = require('../validators/categoryValidator');

// Public routes
// NOTE: /service/:serviceId must come before /:id to avoid Express matching 'service' as an id
router.get('/', getCategories);
router.get('/service/:serviceId', getCategoriesByService);
router.get('/:id', getCategory);

// Protected admin routes
router.post('/', protect, createCategoryValidator, createCategory);
router.put('/:id', protect, updateCategoryValidator, updateCategory);
router.delete('/:id', protect, deleteCategory);

module.exports = router;

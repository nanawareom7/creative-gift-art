const express = require('express');
const router = express.Router();
const {
  createTemplate,
  getTemplates,
  getTemplateBySlug,
  getTemplateById,
  getFeaturedTemplates,
  searchTemplates,
  updateTemplate,
  deleteTemplate,
  uploadTemplateImage,
  uploadTemplateImages,
  deleteUploadedImage,
} = require('../controllers/templateController');
const { protect } = require('../middleware/authMiddleware');
const {
  createTemplateValidator,
  updateTemplateValidator,
} = require('../validators/templateValidator');
const upload = require('../middleware/uploadMiddleware');
const { uploadMultiple } = require('../middleware/uploadMiddleware');

// ─── Public Routes ────────────────────────────────────────────────────────────
// CRITICAL: Specific named routes MUST be declared BEFORE /:slug to prevent
// Express from matching their path segments as slug values.
// Order matters: featured → search → id/:id (admin) → /:slug (public)

router.get('/featured', getFeaturedTemplates);
router.get('/search', searchTemplates);

// ─── Admin: Get template by MongoDB ObjectId (for edit form) ─────────────────
// MUST be before /:slug. The /id/ prefix namespaces it safely.
// Protected: only admins can fetch inactive templates by ID.
router.get('/id/:id', protect, getTemplateById);

// ─── Public: get by slug (last GET, catches everything else) ─────────────────
router.get('/', getTemplates);
router.get('/:slug', getTemplateBySlug);

// ─── Protected Admin Write Routes ────────────────────────────────────────────
router.post('/', protect, createTemplateValidator, createTemplate);
router.put('/:id', protect, updateTemplateValidator, updateTemplate);
router.delete('/:id', protect, deleteTemplate);

// ─── Upload Routes ────────────────────────────────────────────────────────────
router.post(
  '/upload/template-image',
  protect,
  upload.single('image'),
  uploadTemplateImage
);
router.post(
  '/upload/template-images',
  protect,
  uploadMultiple.array('images', 10),
  uploadTemplateImages
);
router.delete('/upload/:filename', protect, deleteUploadedImage);

module.exports = router;

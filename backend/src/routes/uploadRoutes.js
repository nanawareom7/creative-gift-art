const express = require('express');
const router = express.Router();
const {
  uploadTemplateImage,
  uploadTemplateImages,
  deleteUploadedImage,
} = require('../controllers/templateController');
const { protect } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');
const { uploadMultiple } = require('../middleware/uploadMiddleware');

// POST /api/upload/template-image  (single — existing, unchanged)
router.post('/template-image', protect, upload.single('image'), uploadTemplateImage);

// POST /api/upload/template-images  (multiple — up to 10)
router.post('/template-images', protect, uploadMultiple.array('images', 10), uploadTemplateImages);

// DELETE /api/upload/:filename
router.delete('/:filename', protect, deleteUploadedImage);

module.exports = router;

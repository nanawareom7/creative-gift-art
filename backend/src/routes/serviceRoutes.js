const express = require('express');
const router = express.Router();
const {
  createService,
  getServices,
  getService,
  updateService,
  deleteService,
} = require('../controllers/serviceController');
const { protect } = require('../middleware/authMiddleware');
const { createServiceValidator, updateServiceValidator } = require('../validators/serviceValidator');

// Public routes
router.get('/', getServices);
router.get('/:id', getService);

// Protected admin routes
router.post('/', protect, createServiceValidator, createService);
router.put('/:id', protect, updateServiceValidator, updateService);
router.delete('/:id', protect, deleteService);

module.exports = router;

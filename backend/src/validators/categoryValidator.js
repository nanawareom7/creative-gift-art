const { body } = require('express-validator');
const mongoose = require('mongoose');

const createCategoryValidator = [
  body('name')
    .notEmpty()
    .withMessage('Category name is required')
    .isLength({ min: 2 })
    .withMessage('Category name must be at least 2 characters')
    .isLength({ max: 100 })
    .withMessage('Category name cannot exceed 100 characters')
    .trim(),

  body('serviceId')
    .optional({ nullable: true })
    .custom((value) => {
      if (value && !mongoose.Types.ObjectId.isValid(value)) {
        throw new Error('serviceId must be a valid ID');
      }
      return true;
    }),

  body('description')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Description cannot exceed 500 characters')
    .trim(),

  body('image')
    .optional()
    .isString()
    .withMessage('Image must be a string'),

  body('order')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Order must be a non-negative integer'),

  body('isActive')
    .optional()
    .isBoolean()
    .withMessage('isActive must be a boolean value'),
];

const updateCategoryValidator = [
  body('name')
    .optional()
    .isLength({ min: 2 })
    .withMessage('Category name must be at least 2 characters')
    .isLength({ max: 100 })
    .withMessage('Category name cannot exceed 100 characters')
    .trim(),

  body('serviceId')
    .optional({ nullable: true })
    .custom((value) => {
      if (value && !mongoose.Types.ObjectId.isValid(value)) {
        throw new Error('serviceId must be a valid ID');
      }
      return true;
    }),

  body('description')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Description cannot exceed 500 characters')
    .trim(),

  body('image')
    .optional()
    .isString()
    .withMessage('Image must be a string'),

  body('order')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Order must be a non-negative integer'),

  body('isActive')
    .optional()
    .isBoolean()
    .withMessage('isActive must be a boolean value'),
];

module.exports = { createCategoryValidator, updateCategoryValidator };

const { body } = require('express-validator');

const createServiceValidator = [
  body('name')
    .notEmpty()
    .withMessage('Service name is required')
    .isLength({ min: 2 })
    .withMessage('Service name must be at least 2 characters')
    .isLength({ max: 150 })
    .withMessage('Service name cannot exceed 150 characters')
    .trim(),

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

const updateServiceValidator = [
  body('name')
    .optional()
    .isLength({ min: 2 })
    .withMessage('Service name must be at least 2 characters')
    .isLength({ max: 150 })
    .withMessage('Service name cannot exceed 150 characters')
    .trim(),

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

module.exports = { createServiceValidator, updateServiceValidator };

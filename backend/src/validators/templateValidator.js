const { body } = require('express-validator');
const mongoose = require('mongoose');

const createTemplateValidator = [
  body('title')
    .notEmpty()
    .withMessage('Template title is required')
    .isLength({ min: 3 })
    .withMessage('Title must be at least 3 characters')
    .isLength({ max: 200 })
    .withMessage('Title cannot exceed 200 characters')
    .trim(),

  body('categoryId')
    .notEmpty()
    .withMessage('Category is required')
    .custom((value) => {
      if (!mongoose.Types.ObjectId.isValid(value)) {
        throw new Error('categoryId must be a valid ID');
      }
      return true;
    }),

  body('type')
    .optional()
    .isIn(['static', 'video', 'website'])
    .withMessage('Type must be one of: static, video, website'),

  body('serviceId')
    .optional({ nullable: true })
    .custom((value) => {
      if (value && !mongoose.Types.ObjectId.isValid(value)) {
        throw new Error('serviceId must be a valid ID');
      }
      return true;
    }),

  body('youtubeLink')
    .optional()
    .custom((value) => {
      if (value && !/^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+/.test(value)) {
        throw new Error('Please provide a valid YouTube URL');
      }
      return true;
    }),

  body('description')
    .optional()
    .isLength({ max: 2000 })
    .withMessage('Description cannot exceed 2000 characters')
    .trim(),

  body('featured')
    .optional()
    .isBoolean()
    .withMessage('Featured must be a boolean value'),

  body('tags')
    .optional()
    .isArray()
    .withMessage('Tags must be an array')
    .custom((tags) => {
      if (tags && tags.length > 20) {
        throw new Error('Cannot have more than 20 tags');
      }
      return true;
    }),

  body('tags.*')
    .optional()
    .isString()
    .withMessage('Each tag must be a string')
    .isLength({ max: 50 })
    .withMessage('Each tag cannot exceed 50 characters')
    .trim(),

  body('images')
    .optional()
    .isArray()
    .withMessage('Images must be an array')
    .custom((images) => {
      if (images && images.length > 10) {
        throw new Error('Cannot have more than 10 gallery images');
      }
      return true;
    }),

  body('images.*')
    .optional()
    .isString()
    .withMessage('Each image must be a string URL'),

  body('isActive')
    .optional()
    .isBoolean()
    .withMessage('isActive must be a boolean value'),
];

const updateTemplateValidator = [
  body('title')
    .optional()
    .isLength({ min: 3 })
    .withMessage('Title must be at least 3 characters')
    .isLength({ max: 200 })
    .withMessage('Title cannot exceed 200 characters')
    .trim(),

  body('categoryId')
    .optional()
    .custom((value) => {
      if (value && !mongoose.Types.ObjectId.isValid(value)) {
        throw new Error('categoryId must be a valid ID');
      }
      return true;
    }),

  body('type')
    .optional()
    .isIn(['static', 'video', 'website'])
    .withMessage('Type must be one of: static, video, website'),

  body('serviceId')
    .optional({ nullable: true })
    .custom((value) => {
      if (value && !mongoose.Types.ObjectId.isValid(value)) {
        throw new Error('serviceId must be a valid ID');
      }
      return true;
    }),

  body('youtubeLink')
    .optional()
    .custom((value) => {
      if (value && !/^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+/.test(value)) {
        throw new Error('Please provide a valid YouTube URL');
      }
      return true;
    }),

  body('description')
    .optional()
    .isLength({ max: 2000 })
    .withMessage('Description cannot exceed 2000 characters')
    .trim(),

  body('featured')
    .optional()
    .isBoolean()
    .withMessage('Featured must be a boolean value'),

  body('tags')
    .optional()
    .isArray()
    .withMessage('Tags must be an array'),

  body('images')
    .optional()
    .isArray()
    .withMessage('Images must be an array')
    .custom((images) => {
      if (images && images.length > 10) {
        throw new Error('Cannot have more than 10 gallery images');
      }
      return true;
    }),

  body('images.*')
    .optional()
    .isString()
    .withMessage('Each image must be a string URL'),

  body('isActive')
    .optional()
    .isBoolean()
    .withMessage('isActive must be a boolean value'),
];

module.exports = { createTemplateValidator, updateTemplateValidator };

const { body } = require('express-validator');

const blogValidationRules = [
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Blog title is required'),

  body('content')
    .trim()
    .notEmpty()
    .withMessage('Blog content is required'),

  body('excerpt')
    .optional()
    .trim(),

  body('category')
    .optional()
    .trim(),

  body('author')
    .optional()
    .trim(),

  body('status')
    .optional()
    .isIn(['draft', 'published'])
    .withMessage('Status must be either draft or published'),
];

module.exports = { blogValidationRules };

const { body, validationResult } = require('express-validator');

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      message: 'Validation failed',
      errors: errors.array().map((e) => ({ field: e.path, message: e.msg })),
    });
  }
  next();
};

const validateRegister = [
  body('name').trim().notEmpty().withMessage('Name is required').isLength({ max: 50 }).withMessage('Name too long'),
  body('email').isEmail().withMessage('Valid email is required').normalizeEmail(),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('role').optional().isIn(['admin', 'member']).withMessage('Invalid role'),
  handleValidationErrors,
];

const validateLogin = [
  body('email').isEmail().withMessage('Valid email is required').normalizeEmail(),
  body('password').notEmpty().withMessage('Password is required'),
  handleValidationErrors,
];

const validateProject = [
  body('name').trim().notEmpty().withMessage('Project name is required').isLength({ max: 100 }).withMessage('Project name too long'),
  body('description').optional().isLength({ max: 500 }).withMessage('Description too long'),
  body('status').optional().isIn(['planning', 'active', 'on-hold', 'completed']).withMessage('Invalid status'),
  body('priority').optional().isIn(['low', 'medium', 'high']).withMessage('Invalid priority'),
  handleValidationErrors,
];

const validateTask = [
  body('title').trim().notEmpty().withMessage('Task title is required').isLength({ max: 200 }).withMessage('Title too long'),
  body('description').optional().isLength({ max: 1000 }).withMessage('Description too long'),
  body('status').optional().isIn(['todo', 'in-progress', 'done']).withMessage('Invalid status'),
  body('priority').optional().isIn(['low', 'medium', 'high']).withMessage('Invalid priority'),
  body('project').notEmpty().withMessage('Project ID is required'),
  handleValidationErrors,
];

const validateComment = [
  body('content').trim().notEmpty().withMessage('Comment content is required').isLength({ max: 500 }).withMessage('Comment too long'),
  handleValidationErrors,
];

module.exports = {
  validateRegister,
  validateLogin,
  validateProject,
  validateTask,
  validateComment,
};

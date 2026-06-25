import { body, validationResult } from 'express-validator';

export const validateResult = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }
  next();
};

export const registerValidation = [
  body('name').trim().notEmpty().withMessage('Name is required').isLength({ min: 2 }).withMessage('Name must be at least 2 characters'),
  body('email').trim().isEmail().withMessage('Must be a valid email address'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
  validateResult,
];

export const loginValidation = [
  body('email').trim().isEmail().withMessage('Must be a valid email address'),
  body('password').notEmpty().withMessage('Password is required'),
  validateResult,
];

export const contactValidation = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').trim().isEmail().withMessage('Must be a valid email address'),
  body('subject').trim().notEmpty().withMessage('Subject is required'),
  body('message').trim().notEmpty().withMessage('Message is required'),
  validateResult,
];

export const categoryValidation = [
  body('name').trim().notEmpty().withMessage('Category name is required'),
  validateResult,
];

// Used for POST (create) — slug is required
export const postValidation = [
  body('title').trim().notEmpty().withMessage('Title is required'),
  body('slug').trim().notEmpty().withMessage('Slug is required'),
  validateResult,
];

// Used for PUT (update) — slug already stored in DB, not required in body
export const postUpdateValidation = [
  body('title').optional().trim().notEmpty().withMessage('Title cannot be empty if provided'),
  validateResult,
];

export const commentValidation = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').trim().isEmail().withMessage('Valid email is required'),
  body('content').trim().notEmpty().withMessage('Content cannot be empty'),
  validateResult,
];

export const ratingValidation = [
  body('rating').isFloat({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
  validateResult,
];

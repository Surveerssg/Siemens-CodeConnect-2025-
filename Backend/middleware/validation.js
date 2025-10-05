const { body, validationResult } = require('express-validator');

// Validation middleware
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: 'Validation failed',
      details: errors.array()
    });
  }
  next();
};

// User validation rules
const validateUser = [
  body('name').trim().isLength({ min: 2, max: 50 }).withMessage('Name must be 2-50 characters'),
  body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
  body('phone').optional().isMobilePhone().withMessage('Valid phone number required'),
  body('role').isIn(['child', 'parent', 'therapist']).withMessage('Role must be child, parent, or therapist'),
  handleValidationErrors
];

// Progress validation rules
const validateProgress = [
  body('averageScore').isNumeric().isFloat({ min: 0, max: 100 }).withMessage('Average score must be 0-100'),
  body('bestScore').isNumeric().isFloat({ min: 0, max: 100 }).withMessage('Best score must be 0-100'),
  body('practiceDays').isInt({ min: 0 }).withMessage('Practice days must be non-negative integer'),
  body('wordsThisWeek').isInt({ min: 0 }).withMessage('Words this week must be non-negative integer'),
  handleValidationErrors
];

// Game validation rules
const validateGame = [
  body('achievements').isInt({ min: 0 }).withMessage('Achievements must be non-negative integer'),
  body('gamesPlayed').isInt({ min: 0 }).withMessage('Games played must be non-negative integer'),
  body('totalXP').isInt({ min: 0 }).withMessage('Total XP must be non-negative integer'),
  handleValidationErrors
];

// Goals validation rules
const validateGoals = [
  body('currentStreak').isInt({ min: 0 }).withMessage('Current streak must be non-negative integer'),
  body('goalsCompleted').isInt({ min: 0 }).withMessage('Goals completed must be non-negative integer'),
  body('totalXPEarned').isInt({ min: 0 }).withMessage('Total XP earned must be non-negative integer'),
  handleValidationErrors
];

module.exports = {
  handleValidationErrors,
  validateUser,
  validateProgress,
  validateGame,
  validateGoals
};

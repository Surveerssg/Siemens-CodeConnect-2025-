// Global error handling middleware
const errorHandler = (err, req, res, next) => {
  console.error('Error:', err);

  // Default error
  let error = { ...err };
  error.message = err.message;

  // Firebase/Firestore errors
  if (err.code === 'permission-denied') {
    const message = 'Access denied. Insufficient permissions.';
    error = { message, statusCode: 403 };
  }

  if (err.code === 'not-found') {
    const message = 'Resource not found.';
    error = { message, statusCode: 404 };
  }

  if (err.code === 'already-exists') {
    const message = 'Resource already exists.';
    error = { message, statusCode: 409 };
  }

  if (err.code === 'invalid-argument') {
    const message = 'Invalid argument provided.';
    error = { message, statusCode: 400 };
  }

  // Validation errors
  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors).map(val => val.message).join(', ');
    error = { message, statusCode: 400 };
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    const message = 'Invalid token.';
    error = { message, statusCode: 401 };
  }

  if (err.name === 'TokenExpiredError') {
    const message = 'Token expired.';
    error = { message, statusCode: 401 };
  }

  res.status(error.statusCode || 500).json({
    success: false,
    error: error.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};

// 404 handler
const notFound = (req, res, next) => {
  const error = new Error(`Not found - ${req.originalUrl}`);
  res.status(404);
  next(error);
};

module.exports = { errorHandler, notFound };

const errorHandler = (err, req, res, next) => {
  console.error(err.stack);
  
  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors).map(e => e.message);
    return res.status(400).json({
      message: 'Validation Error',
      errors
    });
  }
  
  // Mongoose duplicate key error
  if (err.code === 11000) {
    return res.status(400).json({
      message: 'Duplicate field value entered'
    });
  }
  
  // Mongoose bad ObjectId
  if (err.name === 'CastError') {
    return res.status(404).json({
      message: 'Resource not found'
    });
  }
  
  // Default error
  res.status(err.statusCode || 500).json({
    message: err.message || 'Server Error'
  });
};

module.exports = errorHandler;
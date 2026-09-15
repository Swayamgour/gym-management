const errorHandler = (err, req, res, next) => {
  let error = err;

  if (error.name === 'CastError') {
    error = { statusCode: 400, message: `Invalid value for field '${error.path}': ${error.value}` };
  } else if (error.code === 11000) {
    const field = Object.keys(error.keyValue || {}).join(', ');
    error = { statusCode: 409, message: `Duplicate value for field(s): ${field}` };
  } else if (error.name === 'ValidationError') {
    const messages = Object.values(error.errors).map((val) => val.message);
    error = { statusCode: 400, message: messages.join(', ') };
  }

  const statusCode = error.statusCode || 500;
  const message = error.message || 'Internal Server Error';

  if (statusCode === 500) {
    console.error(err);
  }

  res.status(statusCode).json({
    success: false,
    message,
    errors: error.errors || [],
    ...(process.env.NODE_ENV === 'development' && err.stack ? { stack: err.stack } : {})
  });
};

module.exports = errorHandler;

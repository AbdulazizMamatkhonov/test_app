const errorHandler = (error, req, res, next) => {
  if (res.headersSent) {
    next(error);
    return;
  }

  const status = error.status || 500;

  res.status(status).json({
    error: "Request failed",
    message: error.message,
  });
};

module.exports = errorHandler;

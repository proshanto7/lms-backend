/**
 * Custom operational error class.
 * globalErrorHandler.js reads err.statusCode / err.message / err.errors,
 * so throwing AppError instead of a plain Error gives it clean control
 * over the HTTP response.
 */
class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

export default AppError;
/**
 * Central Error Handler Middleware
 * Strict security requirement: Masks internal exceptions and returns
 * standardized JSON without leaking stack traces or internal prompts.
 */
export function errorHandler(err, req, res, next) {
  // Log error internally for developer debugging
  console.error(`[API Error] ${req.method} ${req.url} - ${err.message}`);

  // Handle explicit status codes if set
  const statusCode = err.status || err.statusCode || 500;

  // Mask stack traces in production response
  res.status(statusCode).json({
    error: statusCode === 400 ? (err.message || 'Bad Request') : 'Internal Server Error'
  });
}

export default errorHandler;

/**
 * Centralized error handler middleware.
 * Returns consistent error JSON and avoids leaking stack traces or sensitive details.
 */
export function errorHandler(err, req, res, next) {
  // If headers already sent, delegate to default express error handler
  if (res.headersSent) {
    return next(err);
  }

  const statusCode = err.status || err.statusCode || 500;
  const isDev = process.env.NODE_ENV === 'development';

  if (statusCode === 500) {
    console.error('[ServerError]', err);
  }

  res.status(statusCode).json({
    error: err.message && statusCode < 500 ? err.message : 'Something went wrong',
    ...(isDev && statusCode === 500 ? { details: err.message } : {})
  });
}

/**
 * Fallback 404 handler for undefined API routes.
 */
export function notFoundHandler(req, res) {
  res.status(404).json({
    error: 'Endpoint not found'
  });
}

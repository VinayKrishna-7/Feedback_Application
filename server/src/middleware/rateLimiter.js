import rateLimit from 'express-rate-limit';

const isDev = process.env.NODE_ENV === 'development' || !process.env.NODE_ENV;

/**
 * Rate limiter for public feedback submissions to prevent spam.
 * Note: Keeps rate limiting state entirely in-memory; no IP addresses or client IDs
 * are stored in the database.
 */
export const feedbackSubmissionLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: isDev ? 1000 : 60, // Friendly high limit in dev/testing
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: 'Too many feedback submissions. Please wait a little while before trying again.'
  }
});

/**
 * General rate limiter for form creation to prevent abuse.
 */
export const formCreationLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: isDev ? 500 : 30, // Friendly high limit in dev/testing
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: 'Too many forms created from this connection. Please try again later.'
  }
});

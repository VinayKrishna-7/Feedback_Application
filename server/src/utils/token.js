import crypto from 'crypto';

/**
 * Generates a cryptographically secure URL-friendly token for public links.
 * E.g., 8 characters like '7xK92pLm'
 */
export function generatePublicToken(length = 8) {
  // base64url is URL-safe: uses [A-Z], [a-z], [0-9], '-', '_'
  // Generate random bytes and convert to base64url
  return crypto.randomBytes(Math.ceil((length * 3) / 4))
    .toString('base64url')
    .slice(0, length);
}

/**
 * Generates a cryptographically secure random token for private management dashboard access.
 * E.g., 32 characters like 'a8Kx92LmP7vQ2zN4rT9...'
 */
export function generateAdminToken(length = 32) {
  return crypto.randomBytes(Math.ceil((length * 3) / 4))
    .toString('base64url')
    .slice(0, length);
}

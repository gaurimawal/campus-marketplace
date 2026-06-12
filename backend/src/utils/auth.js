/**
 * JWT authentication and role-based authorization helpers.
 */

import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'campus-marketplace-dev-secret';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

export const ROLES = {
  STUDENT: 'student',
  ADMIN: 'admin',
};

/**
 * Generate a signed JWT for an authenticated user.
 */
export function generateToken(user) {
  return jwt.sign(
    {
      userId: user.userId,
      email: user.email,
      role: user.role,
      name: user.name,
    },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );
}

/**
 * Verify and decode a JWT token.
 */
export function verifyToken(token) {
  return jwt.verify(token, JWT_SECRET);
}

/**
 * Extract authenticated user from API Gateway event headers.
 * Returns null if no valid token is present.
 */
export function authenticate(event) {
  const authHeader =
    event.headers?.Authorization || event.headers?.authorization;

  if (!authHeader?.startsWith('Bearer ')) {
    return null;
  }

  const token = authHeader.slice(7);

  try {
    return verifyToken(token);
  } catch {
    return null;
  }
}

/**
 * Require authentication — throws if user is not logged in.
 */
export function requireAuth(event) {
  const user = authenticate(event);
  if (!user) {
    const err = new Error('Authentication required');
    err.statusCode = 401;
    throw err;
  }
  return user;
}

/**
 * Require one of the specified roles.
 */
export function requireRole(user, ...allowedRoles) {
  if (!allowedRoles.includes(user.role)) {
    const err = new Error('Insufficient permissions');
    err.statusCode = 403;
    throw err;
  }
}

/**
 * Check if user can manage a listing (owner or admin).
 */
export function canManageListing(user, listing) {
  return user.role === ROLES.ADMIN || listing.sellerId === user.userId;
}

/**
 * Strip password hash from user object before sending to client.
 */
export function sanitizeUser(user) {
  if (!user) return null;
  const { passwordHash, ...safe } = user;
  return safe;
}

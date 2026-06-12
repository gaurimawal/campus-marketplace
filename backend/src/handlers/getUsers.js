/**
 * GET /auth/users - List all users (admin only).
 */

import { getAllUsers } from '../utils/users.js';
import { requireAuth, requireRole, sanitizeUser, ROLES } from '../utils/auth.js';
import { success, error } from '../utils/response.js';

export async function handler(event) {
  try {
    const user = requireAuth(event);
    requireRole(user, ROLES.ADMIN);

    const users = await getAllUsers();
    return success(200, {
      users: users.map(sanitizeUser).sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      ),
    });
  } catch (err) {
    if (err.statusCode) {
      return error(err.statusCode, err.message);
    }
    console.error('getUsers error:', err);
    return error(500, 'Failed to fetch users');
  }
}

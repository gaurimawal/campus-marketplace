/**
 * PUT /auth/users/{id}/role - Update a user's role (admin only).
 */

import { getUserById, updateUserRole } from '../utils/users.js';
import { requireAuth, requireRole, sanitizeUser, ROLES } from '../utils/auth.js';
import { success, error } from '../utils/response.js';

const VALID_ROLES = [ROLES.STUDENT, ROLES.ADMIN];

export async function handler(event) {
  try {
    const admin = requireAuth(event);
    requireRole(admin, ROLES.ADMIN);

    const userId = event.pathParameters?.id;
    if (!userId) {
      return error(400, 'User ID is required');
    }

    const body = JSON.parse(event.body || '{}');
    const { role } = body;

    if (!VALID_ROLES.includes(role)) {
      return error(400, `Role must be one of: ${VALID_ROLES.join(', ')}`);
    }

    const target = await getUserById(userId);
    if (!target) {
      return error(404, 'User not found');
    }

    if (target.userId === admin.userId && role !== ROLES.ADMIN) {
      return error(400, 'You cannot demote your own admin account');
    }

    const updated = await updateUserRole(userId, role);
    return success(200, { user: sanitizeUser(updated) });
  } catch (err) {
    if (err.statusCode) {
      return error(err.statusCode, err.message);
    }
    console.error('updateUserRole error:', err);
    return error(500, 'Failed to update user role');
  }
}

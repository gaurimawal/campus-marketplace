/**
 * GET /auth/me - Return the currently authenticated user.
 */

import { getUserById } from '../utils/users.js';
import { requireAuth, sanitizeUser } from '../utils/auth.js';
import { success, error } from '../utils/response.js';

export async function handler(event) {
  try {
    const authUser = requireAuth(event);
    const user = await getUserById(authUser.userId);

    if (!user) {
      return error(404, 'User not found');
    }

    return success(200, { user: sanitizeUser(user) });
  } catch (err) {
    if (err.statusCode) {
      return error(err.statusCode, err.message);
    }
    console.error('getMe error:', err);
    return error(500, 'Failed to fetch user profile');
  }
}

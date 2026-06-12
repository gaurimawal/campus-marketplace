/**
 * POST /auth/login - Authenticate user and return JWT.
 */

import { getUserByEmail } from '../utils/users.js';
import { comparePassword } from '../utils/password.js';
import { generateToken, sanitizeUser } from '../utils/auth.js';
import { success, error } from '../utils/response.js';

export async function handler(event) {
  try {
    const body = JSON.parse(event.body || '{}');
    const { email, password } = body;

    if (!email?.trim() || !password) {
      return error(400, 'Email and password are required');
    }

    const user = await getUserByEmail(email.trim().toLowerCase());
    if (!user) {
      return error(401, 'Invalid email or password');
    }

    const valid = await comparePassword(password, user.passwordHash);
    if (!valid) {
      return error(401, 'Invalid email or password');
    }

    const token = generateToken(user);
    return success(200, { user: sanitizeUser(user), token });
  } catch (err) {
    console.error('login error:', err);
    return error(500, 'Failed to login');
  }
}

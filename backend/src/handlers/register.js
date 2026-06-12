/**
 * POST /auth/register - Register a new student account.
 */

import { v4 as uuidv4 } from 'uuid';
import { createUser, getUserByEmail } from '../utils/users.js';
import { hashPassword } from '../utils/password.js';
import { generateToken, sanitizeUser, ROLES } from '../utils/auth.js';
import { success, error } from '../utils/response.js';

export async function handler(event) {
  try {
    const body = JSON.parse(event.body || '{}');
    const { name, email, password } = body;

    if (!name?.trim()) {
      return error(400, 'Name is required');
    }
    if (!email?.trim()) {
      return error(400, 'Email is required');
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return error(400, 'Invalid email format');
    }
    if (!password || password.length < 6) {
      return error(400, 'Password must be at least 6 characters');
    }

    const normalizedEmail = email.trim().toLowerCase();
    const existing = await getUserByEmail(normalizedEmail);
    if (existing) {
      return error(409, 'An account with this email already exists');
    }

    const user = {
      userId: uuidv4(),
      name: name.trim(),
      email: normalizedEmail,
      passwordHash: await hashPassword(password),
      role: ROLES.STUDENT,
      createdAt: new Date().toISOString(),
    };

    await createUser(user);

    const token = generateToken(user);
    return success(201, { user: sanitizeUser(user), token });
  } catch (err) {
    console.error('register error:', err);
    return error(500, 'Failed to register account');
  }
}

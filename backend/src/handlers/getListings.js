/**
 * GET /listings - Fetch all active listings.
 */

import { getAllListings } from '../utils/dynamodb.js';
import { success, error } from '../utils/response.js';

export async function handler() {
  try {
    const listings = await getAllListings();
    listings.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    return success(200, { listings });
  } catch (err) {
    console.error('getListings error:', err);
    return error(500, 'Failed to fetch listings');
  }
}

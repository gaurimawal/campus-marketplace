/**
 * GET /listings/{id} - Fetch a single listing by ID.
 */

import { getListingById } from '../utils/dynamodb.js';
import { success, error } from '../utils/response.js';

export async function handler(event) {
  try {
    const listingId = event.pathParameters?.id;

    if (!listingId) {
      return error(400, 'Listing ID is required');
    }

    const listing = await getListingById(listingId);

    if (!listing) {
      return error(404, 'Listing not found');
    }

    return success(200, { listing });
  } catch (err) {
    console.error('getListing error:', err);
    return error(500, 'Failed to fetch listing');
  }
}

/**
 * DELETE /listings/{id} - Delete a listing (owner or admin).
 */

import { getListingById, deleteListing } from '../utils/dynamodb.js';
import { deleteImageFromUrl } from '../utils/s3.js';
import { requireAuth, canManageListing } from '../utils/auth.js';
import { success, error } from '../utils/response.js';

export async function handler(event) {
  try {
    const user = requireAuth(event);
    const listingId = event.pathParameters?.id;

    if (!listingId) {
      return error(400, 'Listing ID is required');
    }

    const existing = await getListingById(listingId);
    if (!existing) {
      return error(404, 'Listing not found');
    }

    if (!canManageListing(user, existing)) {
      return error(403, 'You can only delete your own listings');
    }

    if (existing.imageUrl) {
      await deleteImageFromUrl(existing.imageUrl);
    }

    await deleteListing(listingId);
    return success(200, { message: 'Listing deleted successfully' });
  } catch (err) {
    if (err.statusCode) {
      return error(err.statusCode, err.message);
    }
    console.error('deleteListing error:', err);
    return error(500, 'Failed to delete listing');
  }
}

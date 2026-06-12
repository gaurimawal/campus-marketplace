/**
 * PUT /listings/{id} - Update an existing listing (owner or admin).
 */

import { getListingById, updateListing } from '../utils/dynamodb.js';
import { deleteImageFromUrl } from '../utils/s3.js';
import { requireAuth, canManageListing } from '../utils/auth.js';
import { success, error } from '../utils/response.js';

const VALID_CATEGORIES = [
  'Textbooks',
  'Calculators',
  'Graphics Tools',
  'Engineering Instruments',
  'Lab Equipment',
  'Study Materials',
  'Others',
];
const VALID_CONDITIONS = ['New', 'Like New', 'Good', 'Fair', 'Poor'];
const VALID_STATUSES = ['Available', 'Reserved', 'Sold', 'Donated'];

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
      return error(403, 'You can only edit your own listings');
    }

    const body = JSON.parse(event.body || '{}');

    if (body.category && !VALID_CATEGORIES.includes(body.category)) {
      return error(400, `Category must be one of: ${VALID_CATEGORIES.join(', ')}`);
    }
    if (body.condition && !VALID_CONDITIONS.includes(body.condition)) {
      return error(400, `Condition must be one of: ${VALID_CONDITIONS.join(', ')}`);
    }
    if (body.status && !VALID_STATUSES.includes(body.status)) {
      return error(400, `Status must be one of: ${VALID_STATUSES.join(', ')}`);
    }
    if (body.price !== undefined && Number(body.price) < 0) {
      return error(400, 'Price must be a non-negative number');
    }

    if (body.imageUrl !== undefined && body.imageUrl !== existing.imageUrl && existing.imageUrl) {
      await deleteImageFromUrl(existing.imageUrl);
    }

    const updates = {};
    if (body.productName !== undefined) updates.productName = body.productName.trim();
    if (body.category !== undefined) updates.category = body.category;
    if (body.condition !== undefined) updates.condition = body.condition;
    if (body.price !== undefined) updates.price = Number(body.price);
    if (body.description !== undefined) updates.description = body.description.trim();
    if (body.contact !== undefined) updates.contact = body.contact.trim();
    if (body.pickupSpot !== undefined) updates.pickupSpot = body.pickupSpot.trim();
    if (body.imageUrl !== undefined) updates.imageUrl = body.imageUrl;
    if (body.imageUrls !== undefined) updates.imageUrls = body.imageUrls;
    if (body.purchaseYear !== undefined) updates.purchaseYear = body.purchaseYear ? Number(body.purchaseYear) : null;
    if (body.usageDuration !== undefined) updates.usageDuration = body.usageDuration.trim();
    if (body.status !== undefined) updates.status = body.status;

    const listing = await updateListing(listingId, updates);
    return success(200, { listing });
  } catch (err) {
    if (err.statusCode) {
      return error(err.statusCode, err.message);
    }
    console.error('updateListing error:', err);
    return error(500, 'Failed to update listing');
  }
}

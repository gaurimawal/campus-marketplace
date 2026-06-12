/**
 * POST /listings - Create a new marketplace listing (authenticated).
 */

import { v4 as uuidv4 } from 'uuid';
import { createListing } from '../utils/dynamodb.js';
import { requireAuth, requireRole, ROLES } from '../utils/auth.js';
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
    requireRole(user, ROLES.STUDENT);

    const body = JSON.parse(event.body || '{}');
    const {
      productName,
      category,
      condition,
      price,
      description,
      contact,
      pickupSpot,
      imageUrl,
      imageUrls,
      purchaseYear,
      usageDuration,
      status,
    } = body;

    if (!productName?.trim()) {
      return error(400, 'Product name is required');
    }
    if (!VALID_CATEGORIES.includes(category)) {
      return error(400, `Category must be one of: ${VALID_CATEGORIES.join(', ')}`);
    }
    if (condition && !VALID_CONDITIONS.includes(condition)) {
      return error(400, `Condition must be one of: ${VALID_CONDITIONS.join(', ')}`);
    }
    if (status && !VALID_STATUSES.includes(status)) {
      return error(400, `Status must be one of: ${VALID_STATUSES.join(', ')}`);
    }
    if (price === undefined || price === null || Number(price) < 0) {
      return error(400, 'Valid price is required');
    }
    if (!description?.trim()) {
      return error(400, 'Description is required');
    }
    if (!contact?.trim()) {
      return error(400, 'Contact number is required');
    }

    const listing = {
      listingId: uuidv4(),
      productName: productName.trim(),
      category,
      condition: condition || 'Good',
      price: Number(price),
      description: description.trim(),
      contact: contact.trim(),
      pickupSpot: pickupSpot?.trim() || '',
      imageUrl: imageUrl || (imageUrls && imageUrls[0]) || '',
      imageUrls: imageUrls || [],
      purchaseYear: purchaseYear ? Number(purchaseYear) : null,
      usageDuration: usageDuration?.trim() || '',
      status: status || 'Available',
      sellerId: user.userId,
      sellerName: user.name,
      createdAt: new Date().toISOString(),
    };

    await createListing(listing);
    return success(201, { listing });
  } catch (err) {
    if (err.statusCode) {
      return error(err.statusCode, err.message);
    }
    console.error('createListing error:', err);
    return error(500, 'Failed to create listing');
  }
}

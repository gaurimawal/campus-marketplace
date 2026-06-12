/**
 * POST /upload - Upload image to S3 and return the public URL.
 * Accepts JSON body: { image: base64String, contentType: 'image/jpeg' }
 * Or returns presigned URL: { mode: 'presigned', contentType, extension }
 */

import { uploadImageFromBase64, getPresignedUploadUrl } from '../utils/s3.js';
import { requireAuth } from '../utils/auth.js';
import { success, error } from '../utils/response.js';

export async function handler(event) {
  try {
    requireAuth(event);
    const body = JSON.parse(event.body || '{}');

    // Presigned URL mode for direct client-to-S3 upload
    if (body.mode === 'presigned') {
      const { contentType = 'image/jpeg', extension = 'jpg' } = body;
      const result = await getPresignedUploadUrl(contentType, extension);
      return success(200, result);
    }

    // Direct base64 upload through Lambda
    const { image, contentType = 'image/jpeg' } = body;

    if (!image) {
      return error(400, 'Image data is required');
    }

    const result = await uploadImageFromBase64(image, contentType);
    return success(200, result);
  } catch (err) {
    if (err.statusCode) {
      return error(err.statusCode, err.message);
    }
    console.error('uploadImage error:', err);
    return error(500, 'Failed to upload image');
  }
}

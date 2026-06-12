import { ACCEPTED_IMAGE_TYPES, MAX_IMAGE_SIZE_MB } from './constants';

/**
 * Validate image file before upload.
 */
export function validateImageFile(file) {
  if (!file) {
    return 'Please select an image file';
  }

  if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
    return 'Only JPEG, PNG, WebP, and GIF images are allowed';
  }

  const maxBytes = MAX_IMAGE_SIZE_MB * 1024 * 1024;
  if (file.size > maxBytes) {
    return `Image must be smaller than ${MAX_IMAGE_SIZE_MB}MB`;
  }

  return null;
}

/**
 * Convert File to base64 string (without data URL prefix).
 */
export function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result.split(',')[1];
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/**
 * Create a local preview URL for an image file.
 */
export function createPreviewUrl(file) {
  return URL.createObjectURL(file);
}

/**
 * Rotate an image file and return a new JPEG File.
 */


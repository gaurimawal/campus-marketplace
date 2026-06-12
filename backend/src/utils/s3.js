/**
 * S3 utilities for image upload and deletion.
 */

import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { v4 as uuidv4 } from 'uuid';

const s3Client = new S3Client({});

const BUCKET_NAME = process.env.IMAGES_BUCKET;
const REGION = process.env.AWS_REGION || 'us-east-1';

/**
 * Generate a presigned URL for direct client upload to S3.
 */
export async function getPresignedUploadUrl(contentType, extension = 'jpg') {
  const key = `listings/${uuidv4()}.${extension}`;

  const command = new PutObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
    ContentType: contentType,
  });

  const uploadUrl = await getSignedUrl(s3Client, command, { expiresIn: 300 });
  const imageUrl = `https://${BUCKET_NAME}.s3.${REGION}.amazonaws.com/${key}`;

  return { uploadUrl, imageUrl, key };
}

/**
 * Upload image directly from base64-encoded body (Lambda proxy).
 */
export async function uploadImageFromBase64(base64Data, contentType) {
  const extension = contentType?.split('/')[1] || 'jpg';
  const key = `listings/${uuidv4()}.${extension}`;
  const buffer = Buffer.from(base64Data, 'base64');

  await s3Client.send(
    new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
      Body: buffer,
      ContentType: contentType || 'image/jpeg',
    })
  );

  const imageUrl = `https://${BUCKET_NAME}.s3.${REGION}.amazonaws.com/${key}`;
  return { imageUrl, key };
}

/**
 * Delete an image from S3 by extracting key from URL.
 */
export async function deleteImageFromUrl(imageUrl) {
  if (!imageUrl || !BUCKET_NAME) return;

  try {
    const url = new URL(imageUrl);
    const key = url.pathname.slice(1); // Remove leading slash

    await s3Client.send(
      new DeleteObjectCommand({
        Bucket: BUCKET_NAME,
        Key: key,
      })
    );
  } catch (err) {
    console.warn('Failed to delete S3 image:', err.message);
  }
}

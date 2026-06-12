/**
 * Deploy frontend build to S3 static website hosting.
 *
 * Usage:
 *   FRONTEND_BUCKET=your-bucket-name node scripts/deploy.js
 *   CLOUDFRONT_DISTRIBUTION_ID=xxx node scripts/deploy.js  (optional invalidation)
 */

import { execSync } from 'child_process';
import { existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const distPath = join(__dirname, '..', 'dist');

const bucket = process.env.FRONTEND_BUCKET;
const distributionId = process.env.CLOUDFRONT_DISTRIBUTION_ID;

if (!bucket) {
  console.error('Error: Set FRONTEND_BUCKET environment variable');
  process.exit(1);
}

if (!existsSync(distPath)) {
  console.error('Error: dist/ folder not found. Run npm run build first.');
  process.exit(1);
}

console.log(`Deploying to s3://${bucket}...`);

execSync(`aws s3 sync ${distPath} s3://${bucket} --delete`, { stdio: 'inherit' });

if (distributionId) {
  console.log(`Invalidating CloudFront distribution ${distributionId}...`);
  execSync(
    `aws cloudfront create-invalidation --distribution-id ${distributionId} --paths "/*"`,
    { stdio: 'inherit' }
  );
}

console.log('Deployment complete!');

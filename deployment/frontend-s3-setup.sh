#!/bin/bash
# Setup S3 bucket for static website hosting
# Usage: ./frontend-s3-setup.sh my-bucket-name

BUCKET_NAME=$1
REGION=${AWS_REGION:-us-east-1}

if [ -z "$BUCKET_NAME" ]; then
  echo "Usage: ./frontend-s3-setup.sh <bucket-name>"
  exit 1
fi

echo "Creating S3 bucket: $BUCKET_NAME"
aws s3 mb s3://$BUCKET_NAME --region $REGION

echo "Enabling static website hosting..."
aws s3 website s3://$BUCKET_NAME \
  --index-document index.html \
  --error-document index.html

echo "Applying bucket policy for public read access..."
cat > /tmp/bucket-policy.json << EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadGetObject",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::$BUCKET_NAME/*"
    }
  ]
}
EOF

aws s3api put-bucket-policy --bucket $BUCKET_NAME --policy file:///tmp/bucket-policy.json

echo "Done! Website URL:"
aws s3api get-bucket-website --bucket $BUCKET_NAME --query 'WebsiteConfiguration' --output text

/**
 * DynamoDB client and table operations for Listings.
 */

import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import {
  DynamoDBDocumentClient,
  ScanCommand,
  GetCommand,
  PutCommand,
  UpdateCommand,
  DeleteCommand,
} from '@aws-sdk/lib-dynamodb';

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

const TABLE_NAME = process.env.LISTINGS_TABLE || 'Listings';

export async function getAllListings() {
  const result = await docClient.send(
    new ScanCommand({ TableName: TABLE_NAME })
  );
  return result.Items || [];
}

export async function getListingById(listingId) {
  const result = await docClient.send(
    new GetCommand({
      TableName: TABLE_NAME,
      Key: { listingId },
    })
  );
  return result.Item || null;
}

export async function createListing(listing) {
  await docClient.send(
    new PutCommand({
      TableName: TABLE_NAME,
      Item: listing,
      ConditionExpression: 'attribute_not_exists(listingId)',
    })
  );
  return listing;
}

export async function updateListing(listingId, updates) {
  const allowedFields = [
    'productName',
    'category',
    'price',
    'description',
    'contact',
    'imageUrl',
    'imageUrls',
    'condition',
    'purchaseYear',
    'usageDuration',
    'status',
    'pickupSpot',
  ];

  const updateExpressions = [];
  const expressionAttributeNames = {};
  const expressionAttributeValues = {};

  allowedFields.forEach((field) => {
    if (updates[field] !== undefined) {
      updateExpressions.push(`#${field} = :${field}`);
      expressionAttributeNames[`#${field}`] = field;
      expressionAttributeValues[`:${field}`] = updates[field];
    }
  });

  if (updateExpressions.length === 0) {
    throw new Error('No valid fields to update');
  }

  const result = await docClient.send(
    new UpdateCommand({
      TableName: TABLE_NAME,
      Key: { listingId },
      UpdateExpression: `SET ${updateExpressions.join(', ')}`,
      ExpressionAttributeNames: expressionAttributeNames,
      ExpressionAttributeValues: expressionAttributeValues,
      ReturnValues: 'ALL_NEW',
    })
  );

  return result.Attributes;
}

export async function deleteListing(listingId) {
  await docClient.send(
    new DeleteCommand({
      TableName: TABLE_NAME,
      Key: { listingId },
    })
  );
}

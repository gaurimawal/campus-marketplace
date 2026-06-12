/**
 * DynamoDB operations for Users table.
 */

import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import {
  DynamoDBDocumentClient,
  ScanCommand,
  GetCommand,
  PutCommand,
  UpdateCommand,
  QueryCommand,
} from '@aws-sdk/lib-dynamodb';

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

const TABLE_NAME = process.env.USERS_TABLE || 'Users';

export async function getUserById(userId) {
  const result = await docClient.send(
    new GetCommand({
      TableName: TABLE_NAME,
      Key: { userId },
    })
  );
  return result.Item || null;
}

export async function getUserByEmail(email) {
  const result = await docClient.send(
    new QueryCommand({
      TableName: TABLE_NAME,
      IndexName: 'EmailIndex',
      KeyConditionExpression: 'email = :email',
      ExpressionAttributeValues: { ':email': email.toLowerCase() },
    })
  );
  return result.Items?.[0] || null;
}

export async function createUser(user) {
  await docClient.send(
    new PutCommand({
      TableName: TABLE_NAME,
      Item: user,
      ConditionExpression: 'attribute_not_exists(userId)',
    })
  );
  return user;
}

export async function getAllUsers() {
  const result = await docClient.send(
    new ScanCommand({ TableName: TABLE_NAME })
  );
  return result.Items || [];
}

export async function updateUserRole(userId, role) {
  const result = await docClient.send(
    new UpdateCommand({
      TableName: TABLE_NAME,
      Key: { userId },
      UpdateExpression: 'SET #role = :role',
      ExpressionAttributeNames: { '#role': 'role' },
      ExpressionAttributeValues: { ':role': role },
      ReturnValues: 'ALL_NEW',
    })
  );
  return result.Attributes;
}

export async function updateUserStatus(userId, status) {
  const result = await docClient.send(
    new UpdateCommand({
      TableName: TABLE_NAME,
      Key: { userId },
      UpdateExpression: 'SET accountStatus = :status',
      ExpressionAttributeValues: { ':status': status },
      ReturnValues: 'ALL_NEW',
    })
  );
  return result.Attributes;
}

export async function deleteUser(userId) {
  await docClient.send(
    new DeleteCommand({
      TableName: TABLE_NAME,
      Key: { userId },
    })
  );
}

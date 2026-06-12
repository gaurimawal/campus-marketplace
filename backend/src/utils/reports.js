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

const TABLE_NAME = process.env.REPORTS_TABLE || 'Reports';

export async function createReport(report) {
  await docClient.send(
    new PutCommand({
      TableName: TABLE_NAME,
      Item: report,
      ConditionExpression: 'attribute_not_exists(reportId)',
    })
  );
  return report;
}

export async function getAllReports() {
  const result = await docClient.send(
    new ScanCommand({ TableName: TABLE_NAME })
  );
  return result.Items || [];
}

export async function getReportById(reportId) {
  const result = await docClient.send(
    new GetCommand({
      TableName: TABLE_NAME,
      Key: { reportId },
    })
  );
  return result.Item || null;
}

export async function updateReportStatus(reportId, status) {
  const result = await docClient.send(
    new UpdateCommand({
      TableName: TABLE_NAME,
      Key: { reportId },
      UpdateExpression: 'SET #status = :status',
      ExpressionAttributeNames: { '#status': 'status' },
      ExpressionAttributeValues: { ':status': status },
      ReturnValues: 'ALL_NEW',
    })
  );
  return result.Attributes;
}

export async function deleteReport(reportId) {
  await docClient.send(
    new DeleteCommand({
      TableName: TABLE_NAME,
      Key: { reportId },
    })
  );
}

export async function deleteReportsByListingId(listingId) {
  try {
    const all = await getAllReports();
    const matches = all.filter((r) => r.listingId === listingId);
    for (const item of matches) {
      await deleteReport(item.reportId);
    }
  } catch (err) {
    console.warn('deleteReportsByListingId error:', err.message);
  }
}

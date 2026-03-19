const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const { DynamoDBDocumentClient, PutCommand, GetCommand } = require("@aws-sdk/lib-dynamodb");

const client = new DynamoDBClient({});
const ddb = DynamoDBDocumentClient.from(client);
const TABLE = process.env.REPORTS_TABLE;

// Cache an insight report with 24hr TTL
async function cacheReport(reportId, data) {
    const ttl = Math.floor(Date.now() / 1000) + 60 * 60 * 24; // 24 hours

    await ddb.send(new PutCommand({
        TableName: TABLE,
        Item: {
            reportId,
            data,
            ttl,
            createdAt: new Date().toISOString(),
        },
    }));
}

// Get a cached report by ID
async function getCachedReport(reportId) {
    const result = await ddb.send(new GetCommand({
        TableName: TABLE,
        Key: { reportId },
    }));

    if (!result.Item) return null;

    // Check if TTL has expired
    const now = Math.floor(Date.now() / 1000);
    if (result.Item.ttl < now) return null;

    return result.Item.data;
}

module.exports = { cacheReport, getCachedReport };
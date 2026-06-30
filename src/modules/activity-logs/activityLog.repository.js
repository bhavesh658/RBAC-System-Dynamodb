const { v4: uuidv4 } = require("uuid");
const { PutCommand, ScanCommand, QueryCommand, } = require("@aws-sdk/lib-dynamodb");
const { docClient, } = require("../../config/dynamodb");
const TABLE_NAME = "ActivityLogs";

const create = async (log) => {
    await docClient.send(
        new PutCommand({
            TableName: TABLE_NAME,
            Item: log,
        })
    );

    return log;
};

const getAll = async () => {
    const result = await docClient.send(
        new ScanCommand({
            TableName: TABLE_NAME,
        })
    );

    return result.Items || [];
};

const getByModule = async (module) => {
    const result = await docClient.send(
        new QueryCommand({
            TableName: "ActivityLogs",
            IndexName: "module-index",
            KeyConditionExpression: "#module = :module",
            ExpressionAttributeNames: {
                "#module": "module"
            },
            ExpressionAttributeValues: {
                ":module": module
            }
        })
    );

    return result.Items || [];
};

module.exports = { create, getAll, getByModule, };
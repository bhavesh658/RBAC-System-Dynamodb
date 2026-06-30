const {
    PutCommand,
    GetCommand,
    QueryCommand,
    ScanCommand,
    UpdateCommand,
} = require("@aws-sdk/lib-dynamodb");
const { docClient } = require("../../config/dynamodb");
const TABLE_NAME = "Departments";

const createDepartment = async (department) => {
    await docClient.send(
        new PutCommand({
            TableName: TABLE_NAME,
            Item: department,
        })
    );

    return department;
};

const findByCode = async (code) => {
    const result = await docClient.send(
        new QueryCommand({
            TableName: TABLE_NAME,
            IndexName: "code-index",
            KeyConditionExpression: "#code = :code",
            ExpressionAttributeNames: {
                "#code": "code",
            },
            ExpressionAttributeValues: {
                ":code": code,
            },
        })
    );

    return result.Items?.[0] || null;
};

const findById = async (departmentId) => {
    const result = await docClient.send(
        new GetCommand({
            TableName: TABLE_NAME,
            Key: {
                departmentId,
            },
        })
    );

    return result.Item || null;
};

const getAllDepartments = async () => {
    const result = await docClient.send(
        new ScanCommand({
            TableName: TABLE_NAME,
        })
    );

    return result.Items || [];
};

const updateDepartment = async (
    departmentId,
    updates
) => {
    const updateKeys =
        Object.keys(updates);

    const UpdateExpression =
        "SET " +
        updateKeys
            .map((key) => `#${key} = :${key}`)
            .join(", ");

    const ExpressionAttributeNames = {};
    const ExpressionAttributeValues = {};

    updateKeys.forEach((key) => {
        ExpressionAttributeNames[`#${key}`] =
            key;

        ExpressionAttributeValues[`:${key}`] =
            updates[key];
    });

    const result = await docClient.send(
        new UpdateCommand({
            TableName: TABLE_NAME,
            Key: {
                departmentId,
            },
            UpdateExpression,
            ExpressionAttributeNames,
            ExpressionAttributeValues,
            ReturnValues: "ALL_NEW",
        })
    );

    return result.Attributes;
};

module.exports = {
    createDepartment,
    findByCode,
    findById,
    getAllDepartments,
    updateDepartment,
};
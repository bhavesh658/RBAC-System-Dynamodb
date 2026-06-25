const {
    PutCommand,
    GetCommand,
    ScanCommand,
    UpdateCommand,
} = require("@aws-sdk/lib-dynamodb");

const { docClient } = require("../../config/dynamodb");

const TABLE_NAME = "Roles";

const createRole = async (role) => {
    await docClient.send(
        new PutCommand({
            TableName: TABLE_NAME,
            Item: role,
        })
    );

    return role;
};

const findById = async (roleId) => {
    const result = await docClient.send(
        new GetCommand({
            TableName: TABLE_NAME,
            Key: { roleId },
        })
    );

    return result.Item || null;
};

const findByNameAndDepartment = async (
    name,
    department
) => {
    const result = await docClient.send(
        new ScanCommand({
            TableName: TABLE_NAME,
            FilterExpression:
                "#name = :name AND department = :department",
            ExpressionAttributeNames: {
                "#name": "name",
            },
            ExpressionAttributeValues: {
                ":name": name,
                ":department": department,
            },
        })
    );

    return result.Items?.[0] || null;
};

const getAllRoles = async () => {
    const result = await docClient.send(
        new ScanCommand({
            TableName: TABLE_NAME,
        })
    );

    return result.Items || [];
};

const updateRole = async (roleId, updates) => {
    const keys = Object.keys(updates);

    const UpdateExpression =
        "SET " +
        keys.map(key => `#${key} = :${key}`).join(", ");

    const ExpressionAttributeNames = {};
    const ExpressionAttributeValues = {};

    keys.forEach(key => {
        ExpressionAttributeNames[`#${key}`] = key;
        ExpressionAttributeValues[`:${key}`] = updates[key];
    });

    const result = await docClient.send(
        new UpdateCommand({
            TableName: TABLE_NAME,
            Key: { roleId },
            UpdateExpression,
            ExpressionAttributeNames,
            ExpressionAttributeValues,
            ReturnValues: "ALL_NEW",
        })
    );

    return result.Attributes;
};

const updatePermissions = async (
    roleId,
    permissions
) => {
    const result = await docClient.send(
        new UpdateCommand({
            TableName: TABLE_NAME,
            Key: {
                roleId,
            },

            UpdateExpression:
                "SET #permissions = :permissions, #updatedAt = :updatedAt",

            ExpressionAttributeNames: {
                "#permissions": "permissions",
                "#updatedAt": "updatedAt",
            },

            ExpressionAttributeValues: {
                ":permissions": permissions,
                ":updatedAt": new Date().toISOString(),
            },

            ReturnValues: "ALL_NEW",
        })
    );

    return result.Attributes;
};

module.exports = {
    createRole,
    findById,
    findByNameAndDepartment,
    getAllRoles,
    updateRole,
    updatePermissions,
};
const {
    PutCommand,
    GetCommand,
    ScanCommand,
    UpdateCommand,
    QueryCommand,
} = require("@aws-sdk/lib-dynamodb");

const { docClient } = require("../../config/dynamodb");

const TABLE_NAME = "Projects";

const createProject = async (project) => {
    await docClient.send(
        new PutCommand({
            TableName: TABLE_NAME,
            Item: project,
        })
    );

    return project;
};

const findById = async (projectId) => {
    const result = await docClient.send(
        new GetCommand({
            TableName: TABLE_NAME,
            Key: {
                projectId,
            },
        })
    );

    return result.Item || null;
};

const getAllProjects = async () => {
    const result = await docClient.send(
        new ScanCommand({
            TableName: TABLE_NAME,
        })
    );

    return result.Items || [];
};

const findByManager = async (
    projectManager
) => {
    const result = await docClient.send(
        new QueryCommand({
            TableName: TABLE_NAME,
            IndexName:
                "projectManager-index",
            KeyConditionExpression:
                "projectManager = :projectManager",
            ExpressionAttributeValues: {
                ":projectManager":
                    projectManager,
            },
        })
    );

    return result.Items || [];
};

const findByStatus = async (
    status
) => {
    const result = await docClient.send(
        new QueryCommand({
            TableName: TABLE_NAME,
            IndexName: "status-index",
            KeyConditionExpression:
                "#status = :status",
            ExpressionAttributeNames: {
                "#status": "status",
            },
            ExpressionAttributeValues: {
                ":status": status,
            },
        })
    );

    return result.Items || [];
};

const updateProject = async (
    projectId,
    updates
) => {
    const updateKeys =
        Object.keys(updates);

    const UpdateExpression =
        "SET " +
        updateKeys
            .map(
                (key) =>
                    `#${key} = :${key}`
            )
            .join(", ");

    const ExpressionAttributeNames =
        {};

    const ExpressionAttributeValues =
        {};

    updateKeys.forEach((key) => {
        ExpressionAttributeNames[
            `#${key}`
        ] = key;

        ExpressionAttributeValues[
            `:${key}`
        ] = updates[key];
    });

    const result = await docClient.send(
        new UpdateCommand({
            TableName: TABLE_NAME,
            Key: {
                projectId,
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
    createProject,
    findById,
    getAllProjects,
    findByManager,
    findByStatus,
    updateProject,
};
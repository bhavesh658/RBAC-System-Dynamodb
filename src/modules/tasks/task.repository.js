const {
    PutCommand,
    GetCommand,
    ScanCommand,
    QueryCommand,
    UpdateCommand,
} = require("@aws-sdk/lib-dynamodb");
const { docClient } = require("../../config/dynamodb");
const TABLE_NAME = "Tasks";

const createTask = async (task) => {
    await docClient.send(
        new PutCommand({
            TableName: TABLE_NAME,
            Item: task,
        })
    );

    return task;
};

const findById = async (taskId) => {
    console.log("taskId =>", taskId);
    console.log("type =>", typeof taskId);
    const result = await docClient.send(
        new GetCommand({
            TableName: TABLE_NAME,
            Key: {
                taskId,
            },
        })
    );

    return result.Item || null;
};

const getAllTasks = async () => {
    const result = await docClient.send(
        new ScanCommand({
            TableName: TABLE_NAME,
        })
    );

    return result.Items || [];
};

const findByAssignedTo = async (
    assignedTo
) => {
    const result = await docClient.send(
        new QueryCommand({
            TableName: TABLE_NAME,
            IndexName: "assignedTo-index",
            KeyConditionExpression:
                "assignedTo = :assignedTo",
            ExpressionAttributeValues: {
                ":assignedTo": assignedTo,
            },
        })
    );

    return result.Items || [];
};

const findByProjectId = async (
    projectId
) => {
    const result = await docClient.send(
        new QueryCommand({
            TableName: TABLE_NAME,
            IndexName: "projectId-index",
            KeyConditionExpression:
                "projectId = :projectId",
            ExpressionAttributeValues: {
                ":projectId": projectId,
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

const updateTask = async (
    taskId,
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

    const ExpressionAttributeNames = {};

    const ExpressionAttributeValues = {};

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
                taskId,
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
    createTask,
    findById,
    getAllTasks,
    findByAssignedTo,
    findByProjectId,
    findByStatus,
    updateTask,
};
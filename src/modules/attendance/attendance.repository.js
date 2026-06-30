const { QueryCommand,
    PutCommand,
    UpdateCommand,
    ScanCommand, GetCommand, } = require("@aws-sdk/lib-dynamodb");

const { docClient } =require("../../config/dynamodb");
const TABLE_NAME = "Attendance";





const findTodayAttendance = async (
    userId,
    date
) => {
    const result = await docClient.send(
        new QueryCommand({
            TableName: TABLE_NAME,
            IndexName: "userId-date-index",
            KeyConditionExpression:
                "userId = :userId AND #date = :date",
            ExpressionAttributeNames: {
                "#date": "date",
            },
            ExpressionAttributeValues: {
                ":userId": userId,
                ":date": date,
            },
        })
    );

    return result.Items?.[0] || null;
};

const createAttendance = async (
    attendance
) => {
    await docClient.send(
        new PutCommand({
            TableName: TABLE_NAME,
            Item: attendance,
        })
    );

    return attendance;
};

const updateAttendance = async (
    attendanceId,
    updates
) => {
    const updateKeys =
        Object.keys(updates);

    const UpdateExpression =
        "SET " +
        updateKeys
            .map(
                (key) => `#${key} = :${key}`
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

    const result =
        await docClient.send(
            new UpdateCommand({
                TableName: TABLE_NAME,
                Key: {
                    attendanceId,
                },
                UpdateExpression,
                ExpressionAttributeNames,
                ExpressionAttributeValues,
                ReturnValues: "ALL_NEW",
            })
        );

    return result.Attributes;
};

const findByDate = async (date) => {

    const result =
        await docClient.send(
            new QueryCommand({
                TableName: TABLE_NAME,
                IndexName: "date-index",

                KeyConditionExpression:
                    "#date = :date",

                ExpressionAttributeNames: {
                    "#date": "date",
                },

                ExpressionAttributeValues: {
                    ":date": date,
                },
            })
        );

    return result.Items || [];
};


const getAllAttendances = async () => {

        const result =
            await docClient.send(
                new ScanCommand({
                    TableName: TABLE_NAME,
                })
            );

        return result.Items || [];
    };

const findByUserId = async (
    userId
) => {

    const result =
        await docClient.send(
            new QueryCommand({
                TableName: TABLE_NAME,
                IndexName:
                    "userId-index",

                KeyConditionExpression:
                    "userId = :userId",

                ExpressionAttributeValues:
                {
                    ":userId": userId,
                },
            })
        );

    return result.Items || [];
};

module.exports = {
    findTodayAttendance,
    createAttendance,
    updateAttendance,
    findByDate,
    findByUserId,
    getAllAttendances,
};
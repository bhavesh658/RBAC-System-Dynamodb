const {
    QueryCommand,
    PutCommand,
    GetCommand,
    UpdateCommand,
    DeleteCommand,
    ScanCommand,
} = require("@aws-sdk/lib-dynamodb");

const {
    docClient,
} = require("../../config/dynamodb");
const { createActivityLog } = require("../activity-logs/activityLog.service");

const TABLE_NAME = "Users";

const findByEmail = async (email) => {
    const user = await docClient.send(new QueryCommand({
        TableName: TABLE_NAME,
        IndexName: "email-index",
        KeyConditionExpression: "email = :email",
        ExpressionAttributeValues: {
            ":email": email,
        },
    }));
    return user.Items?.[0] || null
};



const findById = async (userId) => {
    const user = await docClient.send(new GetCommand({
        TableName: TABLE_NAME,
        Key: {
            userId,
        },
    }));
    return (user.Item || null);
}

const createUser = async (user) => {
    const result = await docClient.send(
        new PutCommand({
            TableName: TABLE_NAME,
            Item: user,
        })
    );


    return user;
}

const updateUser = async (userId, updates) => {
    const updateKeys = Object.keys(updates);
    if (!updateKeys.length) {
        throw new Error('No fields to update');
    }

    const ExpressionAttributeNames = {};
    const ExpressionAttributeValues = {};
    const updateExpressions = [];

    updateKeys.forEach((key) => {
        ExpressionAttributeNames[`#${key}`] = key;
        updateExpressions.push(`#${key} = :${key}`);
        ExpressionAttributeValues[`:${key}`] = updates[key];
    });

    const UpdateExpression = 'SET ' + updateExpressions.join(', ');

    try {
        const result = await docClient.send(
            new UpdateCommand({
                TableName: TABLE_NAME,
                Key: { userId },
                UpdateExpression,
                ConditionExpression: 'attribute_exists(userId)', // Check karega ki user exist karta hai ya nahi
                ExpressionAttributeNames,
                ExpressionAttributeValues,
                ReturnValues: 'ALL_NEW',
            })
        );

        return result.Attributes;
    } catch (error) {
        if (error.name === 'ConditionalCheckFailedException') {
            return null; // Service ko pata chal sake ki user valid nahi hai
        }
        throw error;
    }
};


const updateRefreshToken = async (
    userId,
    refreshToken
) => {
    return await updateUser(userId, {
        refreshToken,
        lastLoginAt: new Date().toISOString(),
    });
};

const getUsers = async () => {
    const result = await docClient.send(
        new ScanCommand({
            TableName: TABLE_NAME,
        })
    );

    return result.Items || [];
};
const findByRefreshToken = async (
    refreshToken
) => {
    const result =
        await docClient.send(
            new QueryCommand({
                TableName: TABLE_NAME,
                IndexName:
                    "refreshToken-index",
                KeyConditionExpression:
                    "refreshToken = :refreshToken",
                ExpressionAttributeValues: {
                    ":refreshToken":
                        refreshToken,
                },
            })
        );

    return result.Items?.[0] || null;
};
const clearRefreshToken = async (
    userId
) => {
    return await docClient.send(
        new UpdateCommand({
            TableName: TABLE_NAME,
            Key: {
                userId,
            },
            UpdateExpression:
                "REMOVE refreshToken",
            ReturnValues: "ALL_NEW",
        })
    );
};
const toggleUserStatusInDB = async (userId) => {
    try {
        const result = await docClient.send(
            new UpdateCommand({
                TableName: TABLE_NAME,
                Key: {
                    userId,
                },
                // DynamoDB level par hi status ko NOT se invert/toggle kar rahe hain
                UpdateExpression: 'SET #isActive = NOT #isActive, #updatedAt = :updatedAt',
                
                // Yeh check karega ki user exist karta hai ya nahi
                ConditionExpression: 'attribute_exists(userId)', 
                
                ExpressionAttributeNames: {
                    '#isActive': 'isActive',
                    '#updatedAt': 'updatedAt'
                },
                ExpressionAttributeValues: {
                    ':updatedAt': new Date().toISOString(),
                },
                ReturnValues: 'ALL_NEW', // Updated user data return karega
            })
        );

        return result.Attributes;
    } catch (error) {
        // Agar user database mein nahi mila toh DynamoDB yeh error throw karta hai
        if (error.name === 'ConditionalCheckFailedException') {
            return null; // Service file ko pata chal jaega ki user nahi mila
        }
        throw error;
    }
};

module.exports = {
    findByEmail,
    findById,
    findByRefreshToken,
    createUser,
    updateUser,
    updateRefreshToken,
    getUsers,
    clearRefreshToken,
    toggleUserStatusInDB
};

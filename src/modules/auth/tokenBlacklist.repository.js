const { PutCommand, GetCommand } = require("@aws-sdk/lib-dynamodb");
const { docClient, } = require("../../config/dynamodb");
const TABLE_NAME = "TokenBlacklist";

const create = async (token, expiresAt) => {
  await docClient.send(
    new PutCommand({
      TableName: TABLE_NAME,
      Item: {
        token,
        expiresAt,
        createdAt:
          Math.floor(Date.now() / 1000),
      },
    })
  );
};

const findByToken = async (token) => {
  const result =
    await docClient.send(
      new GetCommand({
        TableName: TABLE_NAME,
        Key: { token },
      })
    );

  return result.Item || null;
};

module.exports = {
  create,
  findByToken,
};
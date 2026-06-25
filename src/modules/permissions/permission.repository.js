const {
  ScanCommand,
} = require("@aws-sdk/lib-dynamodb");

const {docClient,} = require("../../config/dynamodb");

const TABLE_NAME = "Permissions";

const getAllPermissions = async () => {
  const result = await docClient.send(
    new ScanCommand({
      TableName: TABLE_NAME,
    })
  );

  return result.Items || [];
};

module.exports = {
  getAllPermissions,
};
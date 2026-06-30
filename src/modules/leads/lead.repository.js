const {
  PutCommand,
  GetCommand,
  ScanCommand,
  QueryCommand,
  UpdateCommand,
} = require("@aws-sdk/lib-dynamodb");
const { docClient } = require("../../config/dynamodb");
const TABLE_NAME = "Leads";

const createLead = async (lead) => {
  await docClient.send(
    new PutCommand({
      TableName: TABLE_NAME,
      Item: lead,
    })
  );

  return lead;
};

const findById = async (leadId) => {
  const result = await docClient.send(
    new GetCommand({
      TableName: TABLE_NAME,
      Key: {
        leadId,
      },
    })
  );

  return result.Item || null;
};

const getAllLeads = async () => {
  const result = await docClient.send(
    new ScanCommand({
      TableName: TABLE_NAME,
    })
  );

  return result.Items || [];
};

const findByStatus = async (status) => {
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

const findByDepartment = async (
  departmentId
) => {
  const result = await docClient.send(
    new QueryCommand({
      TableName: TABLE_NAME,
      IndexName: "departmentId-index",
      KeyConditionExpression:
        "departmentId = :departmentId",
      ExpressionAttributeValues: {
        ":departmentId": departmentId,
      },
    })
  );

  return result.Items || [];
};

const updateLead = async (
  leadId,
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

  const result = await docClient.send(
    new UpdateCommand({
      TableName: TABLE_NAME,
      Key: {
        leadId,
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
  createLead,
  findById,
  getAllLeads,
  findByStatus,
  findByAssignedTo,
  findByDepartment,
  updateLead,
};
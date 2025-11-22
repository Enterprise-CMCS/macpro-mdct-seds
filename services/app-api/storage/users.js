import dynamoDb from "../libs/dynamodb-lib.js";

/**
 * @param {string} role
 * @returns {Promise<object[]>}
 */
export const scanUsersByRole = async (role) => {
  const response = await dynamoDb.scan({
    TableName: process.env.AuthUserTable,
    FilterExpression: "#role = :role",
    ExpressionAttributeNames: { "#role": "role" },
    ExpressionAttributeValues: { ":role": role },
  });
  return response.Items;
};

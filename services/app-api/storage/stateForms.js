import dynamoDb from "../libs/dynamodb-lib.js";

/**
 * @param {number} year
 * @param {number} quarter
 * @returns {Promise<object[]>}
 */
export const scanFormsByQuarter = async (year, quarter) => {
  const response = await dynamoDb.scan({
    TableName: process.env.StateFormsTable,
    FilterExpression: "#year = :year AND quarter = :quarter",
    ExpressionAttributeNames: { "#year": "year" },
    ExpressionAttributeValues: {
      ":year": year,
      ":quarter": quarter,
    },
  });
  return response.Items;
};

/**
 * @param {number} year
 * @param {number} quarter
 * @param {number} status_id
 * @returns {Promise<object[]>}
 */
export const scanFormsByQuarterAndStatus = async (year, quarter, status_id) => {
  const response = await dynamoDb.scan({
    TableName: process.env.StateFormsTable,
    FilterExpression: "#year = :year AND quarter = :quarter AND status_id = :status_id",
    ExpressionAttributeNames: { "#year": "year" },
    ExpressionAttributeValues: {
      ":year": year,
      ":quarter": quarter,
      ":status_id": status_id,
    },
  });
  return response.Items;
};

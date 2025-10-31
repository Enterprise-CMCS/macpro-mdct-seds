import handler from "../../../libs/handler-lib.js";
import dynamoDb from "../../../libs/dynamodb-lib.js";
import { authorizeAdminOrUserForState } from "../../../auth/authConditions.js";

export const main = handler(async (event, _context) => {
  const data = JSON.parse(event.body);

  await authorizeAdminOrUserForState(event, data.state);

  const startKey = data.startKey;

  const params = {
    TableName: process.env.StateFormsTable,
    Select: "ALL_ATTRIBUTES",
    ExpressionAttributeNames: {
      "#theYear": "year",
    },

    ExpressionAttributeValues: {
      ":state": data.state,
      ":year": parseInt(data.year),
      ":quarter": parseInt(data.quarter),
    },
    FilterExpression:
      "state_id = :state and quarter = :quarter and #theYear = :year",
  };

  // If startKey exists, start the scan from this position
  if (startKey) {
    params.ExclusiveStartKey = startKey;
  }

  return await dynamoDb.scan(params);
});

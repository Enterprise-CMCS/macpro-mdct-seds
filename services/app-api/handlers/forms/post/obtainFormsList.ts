import handler from "../../../libs/handler-lib.ts";
import dynamoDb from "../../../libs/dynamodb-lib.ts";
import { authorizeAdminOrUserForState } from "../../../auth/authConditions.ts";
import { ok } from "../../../libs/response-lib.ts";

export const main = handler(async (event, context) => {
  const data = JSON.parse(event.body);

  await authorizeAdminOrUserForState(event, data.state);

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

  const result = await dynamoDb.scan(params);
  return ok(result);
});

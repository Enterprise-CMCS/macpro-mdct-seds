import { authorizeAdminOrUserForState } from "../../../auth/authConditions.ts";
import dynamodbLib from "../../../libs/dynamodb-lib.ts";
import handler from "../../../libs/handler-lib.ts";
import { ok } from "../../../libs/response-lib.ts";

/**
 * Returns list of all forms based on state
 * This can be used for displaying a list of years and quarters available
 */

export const main = handler(async (event) => {
  let data = JSON.parse(event.body);

  await authorizeAdminOrUserForState(event, data.stateId);

  const params = {
    TableName: process.env.StateFormsTable,
    Select: "ALL_ATTRIBUTES",
    ExpressionAttributeValues: {
      ":stateId": data.stateId,
    },
    FilterExpression: "state_id = :stateId",
    ConsistentRead: true,
  };
  const result = await dynamodbLib.scan(params);
  if (result.Count === 0) {
    throw new Error("No state form list found for this state");
  }
  // Return the matching list of items in response body
  return ok(result.Items);
});

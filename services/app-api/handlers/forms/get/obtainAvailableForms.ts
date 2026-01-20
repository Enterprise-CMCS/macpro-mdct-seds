import { authorizeAdminOrUserForState } from "../../../auth/authConditions.ts";
import dynamodbLib from "../../../libs/dynamodb-lib.ts";
import handler from "../../../libs/handler-lib.ts";
import { APIGatewayProxyEvent } from "../../../shared/types.ts";
import { ok } from "../../../libs/response-lib.ts";

/**
 * Returns list of all forms based on state
 * This can be used for displaying a list of years and quarters available
 */

export const main = handler(async (event: APIGatewayProxyEvent) => {
  const { state } = event.pathParameters!;

  await authorizeAdminOrUserForState(event, state);

  const params = {
    TableName: process.env.StateFormsTable,
    Select: "ALL_ATTRIBUTES",
    ExpressionAttributeValues: {
      ":stateId": state,
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

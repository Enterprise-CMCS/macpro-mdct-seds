import handler from "../../../libs/handler-lib.ts";
import dynamoDb from "../../../libs/dynamodb-lib.ts";
import { authorizeAdminOrUserForState } from "../../../auth/authConditions.ts";
import { APIGatewayProxyEvent } from "../../../shared/types.ts";
import { ok } from "../../../libs/response-lib.ts";

export const main = handler(async (event: APIGatewayProxyEvent) => {
  const { state, year, quarter } = event.pathParameters!;

  await authorizeAdminOrUserForState(event, state);

  const params = {
    TableName: process.env.StateFormsTable,
    Select: "ALL_ATTRIBUTES",
    ExpressionAttributeNames: {
      "#theYear": "year",
    },

    ExpressionAttributeValues: {
      ":state": state,
      ":year": parseInt(year!),
      ":quarter": parseInt(quarter!),
    },
    FilterExpression:
      "state_id = :state and quarter = :quarter and #theYear = :year",
  };

  const result = await dynamoDb.scan(params);
  return ok(result);
});

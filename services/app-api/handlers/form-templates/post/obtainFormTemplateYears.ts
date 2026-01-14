import handler from "../../../libs/handler-lib.ts";
import dynamoDb from "../../../libs/dynamodb-lib.ts";
import { authorizeAdmin } from "../../../auth/authConditions.ts";
import { ok } from "../../../libs/response-lib.ts";

export const main = handler(async (event, context) => {
  await authorizeAdmin(event);

  const params = {
    TableName: process.env.FormTemplatesTable,
    ExpressionAttributeNames: {
      "#theYear": "year",
    },
    ProjectionExpression: "#theYear",
  };

  const result = await dynamoDb.scan(params);

  if (result.Count === 0) {
    return ok([]);
  }

  const resultsArray = result.Items.map((i) => i.year);

  return ok(resultsArray.sort((a, b) => b - a));
});

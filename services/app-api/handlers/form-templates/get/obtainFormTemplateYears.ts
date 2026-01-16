import handler from "../../../libs/handler-lib.ts";
import dynamoDb from "../../../libs/dynamodb-lib.ts";
import { authorizeAdmin } from "../../../auth/authConditions.ts";
import { APIGatewayProxyEvent } from "../../../shared/types.ts";

export const main = handler(async (event: APIGatewayProxyEvent) => {
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
    return [];
  }

  const resultsArray = result.Items.map((i) => i.year);

  return resultsArray.sort((a, b) => b - a);
});

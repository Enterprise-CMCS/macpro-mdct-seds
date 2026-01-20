import handler from "../../../libs/handler-lib.ts";
import dynamoDb from "../../../libs/dynamodb-lib.ts";
import { authorizeAdmin } from "../../../auth/authConditions.ts";
import { APIGatewayProxyEvent } from "../../../shared/types.ts";
import { ok, notFound } from "../../../libs/response-lib.ts";

/**
 * Returns a single form template
 * This can be used for generating form Answers and Questions
 */

export const main = handler(async (event: APIGatewayProxyEvent) => {
  await authorizeAdmin(event);

  const { year } = event.pathParameters!;

  const params = {
    TableName: process.env.FormTemplatesTable,
    // IndexName: "year",
    ExpressionAttributeNames: {
      "#theYear": "year",
    },
    ExpressionAttributeValues: {
      ":year": parseInt(year!),
    },
    KeyConditionExpression: "#theYear = :year",
  };

  const result = await dynamoDb.query(params);
  if (result.Count === 0) {
    return notFound({
      status: 404,
      message: `Could not find form template for year: ${year}`,
    });
  }
  // Return the matching list of items in response body
  return ok(result.Items);
});

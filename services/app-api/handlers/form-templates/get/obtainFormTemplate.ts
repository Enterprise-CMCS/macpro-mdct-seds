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
    Key: { year: parseInt(year!) },
  };

  const template = (await dynamoDb.get(params)).Item;

  if (!template) {
    return notFound(`Could not find form template for year: ${year}`);
  }

  return ok(template);
});

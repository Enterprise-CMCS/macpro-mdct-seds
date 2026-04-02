import handler from "../../libs/handler-lib.ts";
import dynamoDb from "../../libs/dynamodb-lib.ts";
import { forbidden, ok } from "../../libs/response-lib.ts";
import { emptyParser } from "../../libs/parsing.ts";

export const main = handler(emptyParser, async (request) => {
  if (request.user.role !== "admin") {
    return forbidden();
  }

  const params = {
    TableName: process.env.FormTemplatesTable,
    ProjectionExpression: "#year",
    ExpressionAttributeNames: { "#year": "year" },
  };

  const result = await dynamoDb.scan(params);

  const years = result.Items.map((i) => i.year);

  return ok(years);
});

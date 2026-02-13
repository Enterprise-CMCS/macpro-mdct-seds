import handler from "../../libs/handler-lib.ts";
import dynamoDb from "../../libs/dynamodb-lib.ts";
import { forbidden, ok } from "../../libs/response-lib.ts";
import { emptyParser } from "../../libs/parsing.ts";

export const main = handler(emptyParser, async (request) => {
  if (request.user.role !== "admin") {
    return forbidden();
  }

  const params = {
    TableName: process.env.AuthUserTable,
  };

  const result = await dynamoDb.scan(params);

  return ok(result.Items);
});

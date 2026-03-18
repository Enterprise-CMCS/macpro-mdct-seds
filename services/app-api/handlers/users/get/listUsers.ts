import handler from "../../../libs/handler-lib.ts";
import dynamoDb from "../../../libs/dynamodb-lib.ts";
import { authorizeAdmin } from "../../../auth/authConditions.ts";
import { APIGatewayProxyEvent } from "../../../shared/types.ts";
import { ok } from "../../../libs/response-lib.ts";

export const main = handler(async (event: APIGatewayProxyEvent) => {
  await authorizeAdmin(event);

  const params = {
    TableName: process.env.AuthUserTable,
  };

  const result = await dynamoDb.scan(params);

  return ok(result.Items);
});

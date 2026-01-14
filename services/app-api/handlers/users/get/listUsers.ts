import handler from "../../../libs/handler-lib.ts";
import dynamoDb from "../../../libs/dynamodb-lib.ts";
import { authorizeAdmin } from "../../../auth/authConditions.ts";
import { ok } from "../../../libs/response-lib.ts";

export const main = handler(async (event, context) => {
  await authorizeAdmin(event);

  const params = {
    TableName: process.env.AuthUserTable,
  };

  const result = await dynamoDb.scan(params);

  if (!result.Items) {
    throw new Error("No Users not found.");
  }

  return ok(result.Items);
});

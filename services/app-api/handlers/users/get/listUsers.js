import handler from "../../../libs/handler-lib.js";
import dynamoDb from "../../../libs/dynamodb-lib.js";
import { authorizeAdmin } from "../../../auth/authConditions.js";

export const main = handler(async (event, context) => {
  await authorizeAdmin(event);

  const params = {
    TableName:
      process.env.AUTH_USER_TABLE_NAME ?? process.env.AuthUserTableName,
  };

  const result = await dynamoDb.scan(params);

  if (!result.Items) {
    throw new Error("No Users not found.");
  }

  return result.Items;
});

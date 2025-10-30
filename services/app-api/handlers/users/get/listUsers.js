import handler from "../../../libs/handler-lib.js";
import dynamoDb from "../../../libs/dynamodb-lib.js";
import { authorizeAdmin } from "../../../auth/authConditions.js";

export const main = handler(async (event, _context) => {
  await authorizeAdmin(event);

  const params = {
    TableName: process.env.AuthUserTable,
  };

  const result = await dynamoDb.scan(params);

  if (!result.Items) {
    throw new Error("No Users not found.");
  }

  return result.Items;
});

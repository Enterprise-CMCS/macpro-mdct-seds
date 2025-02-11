import handler from "../../../libs/handler-lib.js";
import dynamoDb from "../../../libs/dynamodb-lib.js";
import { authorizeAnyUser } from "../../../auth/authConditions.js";

export const main = handler(async (event, context) => {
  await authorizeAnyUser(event);

  const params = {
    TableName: process.env.FORMS_TABLE,
    Select: "ALL_ATTRIBUTES",
  };

  const result = await dynamoDb.scan(params);

  return result.Items;
});

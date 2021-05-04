import handler from "../../../libs/handler-lib";
import dynamoDb from "../../../libs/dynamodb-lib";

import { getCurrentUserInfo } from "../../../auth/cognito-auth";

export const main = handler(async (event, context) => {
  if (event.source === "serverless-plugin-warmup") return null;

  const params = {
    TableName:
      process.env.AUTH_USER_TABLE_NAME ?? process.env.AuthUserTableName,
  };

  let currentUser = await getCurrentUserInfo(event);

  console.log("~~~this is the current user info: \n\n\n\n");
  console.log(currentUser);

  const result = await dynamoDb.scan(params);

  if (!result.Items) {
    throw new Error("No Users not found.");
  }

  return result.Items;
});
b;

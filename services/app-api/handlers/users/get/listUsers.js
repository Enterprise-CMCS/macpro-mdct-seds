import handler from "../../../libs/handler-lib";
import dynamoDb from "../../../libs/dynamodb-lib";

import { userFromCognitoAuthProvider } from "../../../auth/cognito-auth";

export const main = handler(async (event, context) => {
  // If this invokation is a prewarm, do nothing and return.
  if (event.source == "serverless-plugin-warmup") {
    console.log("Warmed up!");
    return null;
  }

  const user = await userFromCognitoAuthProvider(
    event.requestContext.identity.cognitoAuthenticationProvider
  );

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

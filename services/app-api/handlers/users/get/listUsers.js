import handler from "../../../libs/handler-lib";
import dynamoDb from "../../../libs/dynamodb-lib";

import { userFromCognitoAuthProvider } from "../../../auth/cognito-auth";
import { main as obtainUserByEmail } from "../post/obtainUserByEmail";

export const main = handler(async (event, context) => {
  if (event.source === "serverless-plugin-warmup") return null;

  console.log("!!! in lambda");
  console.log("\n\n\n!!!=>>got provider: ");
  console.log(event.requestContext.identity.cognitoAuthenticationProvider);

  console.log("!!!Retrieving user:");

  const user = await userFromCognitoAuthProvider(
    event.requestContext.identity.cognitoAuthenticationProvider
  );

  console.log("\n\n\n~~~GOT USER!!");
  console.log(user);

  const currentUser = await obtainUserByEmail({
    body: user.email,
  });

  console.log("\n\n\n\n!!!!!current user: ");

  console.log(currentUser);

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

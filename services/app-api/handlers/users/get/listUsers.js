import handler from "../../../libs/handler-lib";
import dynamoDb from "../../../libs/dynamodb-lib";

// import { parseAuthProvider } from "../../../auth/cognito-auth";

export const main = handler(async (event, context) => {
  // If this invokation is a prewarm, do nothing and return.
  if (event.source == "serverless-plugin-warmup") {
    console.log("Warmed up!");
    return null;
  }

  console.log("!!! in lambda");

  console.log("event:");
  console.log(event);
  console.log("context:");
  console.log(context);

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

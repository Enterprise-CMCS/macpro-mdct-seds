import handler from "../../../libs/handler-lib";
import dynamoDb from "../../../libs/dynamodb-lib";
import { userFromCognitoAuthProvider } from "../../../cognitoAuth/authProvider";

export const main = handler(async (event, context) => {
  // If this invokation is a prewarm, do nothing and return.
  if (event.source == "serverless-plugin-warmup") {
    console.log("Warmed up!");
    return null;
  }
  // Cognito authentication provider looks like:
  // cognito-idp.us-east-1.amazonaws.com/us-east-1_xxxxxxxxx,cognito-idp.us-east-1.amazonaws.com/us-east-1_aaaaaaaaa:CognitoSignIn:qqqqqqqq-1111-2222-3333-rrrrrrrrrrrr
  const authProvider =
    event.requestContext.identity.cognitoAuthenticationProvider;
  console.log(authProvider);
  userFromCognitoAuthProvider(authProvider);

  let data = JSON.parse(event.body);
  const params = {
    TableName:
      process.env.AUTH_USER_TABLE_NAME ?? process.env.AuthUserTableName,
    Select: "ALL_ATTRIBUTES",
    ExpressionAttributeValues: {
      ":username": data.username,
    },
    FilterExpression: "username = :username",
  };

  const result = await dynamoDb.scan(params);

  if (result.Count === 0) {
    return false;
  }

  // Return the retrieved item
  return result;
});

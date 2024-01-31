import handler from "../../../libs/handler-lib";
import dynamoDb from "../../../libs/dynamodb-lib";
import {
  authorizeAdminOrUserWithEmail,
  authorizeAnyUser,
} from "../../../auth/authConditions";

export const main = handler(async (event, context) => {
  // If this invocation is a prewarm, do nothing and return.
  if (event.source === "serverless-plugin-warmup") {
    console.log("Warmed up!");
    return null;
  }

  let data = JSON.parse(event.body);

  await authorizeAnyUser(event);

  const result = await obtainUserByEmail(data.email);

  if (!result) return result;
  authorizeAdminOrUserWithEmail(event, result.Items[0].email);

  return result;
});

export const obtainUserByEmail = async (email) => {
  const params = {
    TableName:
      process.env.AUTH_USER_TABLE_NAME ?? process.env.AuthUserTableName,
    Select: "ALL_ATTRIBUTES",
    ExpressionAttributeValues: {
      ":email": email,
    },
    FilterExpression: "email = :email",
  };

  const result = await dynamoDb.scan(params);

  if (result.Count === 0) {
    return false;
  }

  return result;
};

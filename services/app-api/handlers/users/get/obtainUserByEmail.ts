import handler from "../../../libs/handler-lib";
import dynamoDb from "../../../libs/dynamodb-lib";
import { getUserCredentialsFromJwt } from "../../../libs/authorization";

export const main = handler(async (event, context) => {
  // verify whether there is a user logged in
  const currentUser = await getUserCredentialsFromJwt(event);
  if (!currentUser) {
    throw new Error("No authorized user.");
  }

  const data = JSON.parse(event.body);
  return await obtainUserByEmail(data.email);
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

  // Return the retrieved item
  return result;
};

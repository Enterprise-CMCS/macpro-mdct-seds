import handler from "../../../libs/handler-lib";
import dynamoDb from "../../../libs/dynamodb-lib";
import { getUserCredentialsFromJwt } from "../../../libs/authorization";

export const main = handler(async (event, context) => {
  // verify whether there is a user logged in
  const user = await getUserCredentialsFromJwt(event);
  if (!user) {
    throw new Error("No authorized user.");
  }

  const currentUser = await getUserAttributes(user.email);

  const params = {
    TableName:
      process.env.AUTH_USER_TABLE_NAME ?? process.env.AuthUserTableName,
    Key: {
      userId: currentUser.userId,
    },
    UpdateExpression:
      "SET username = :username, #r = :role, states = :states, isActive = :isActive, lastLogin = :lastLogin, usernameSub = :usernameSub",
    ExpressionAttributeValues: {
      ":username": currentUser.username,
      ":role": currentUser.role,
      ":states": currentUser.states ?? "",
      ":isActive": currentUser.isActive ?? "inactive",
      ":lastLogin": new Date().toISOString(),
      ":usernameSub": currentUser.usernameSub ?? null,
    },
    ExpressionAttributeNames: {
      "#r": "role",
    },

    ReturnValues: "ALL_NEW",
  };

  return await dynamoDb.update(params);
});

// get user attributes based on JWT token
const getUserAttributes = async (email: string) => {
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
  return result.Items[0];
};

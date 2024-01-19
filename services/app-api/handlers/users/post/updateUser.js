import handler from "../../../libs/handler-lib";
import dynamoDb from "../../../libs/dynamodb-lib";
import { main as obtainUserByEmail } from "./obtainUserByEmail";
import { getUserCredentialsFromJwt } from "../../../libs/authorization";

export const main = handler(async (event, context) => {
  if (event.source === "serverless-plugin-warmup") return null;

  // verify whether there is a user logged in
  const user = await getUserCredentialsFromJwt(event);
  if (!user) {
    throw new Error("No authorized user.");
  }

  const data = JSON.parse(event.body);

  const body = JSON.stringify({
    email: data.email,
  });

  const currentUser = await obtainUserByEmail({
    body: body,
  });

  const params = {
    TableName:
      process.env.AUTH_USER_TABLE_NAME ?? process.env.AuthUserTableName,
    Key: {
      userId: JSON.parse(currentUser.body)["Items"][0].userId,
    },
    UpdateExpression:
      "SET username = :username, #r = :role, states = :states, isActive = :isActive, lastLogin = :lastLogin, usernameSub = :usernameSub",
    ExpressionAttributeValues: {
      ":username": data.username,
      ":role": data.role,
      ":states": data.states ?? "",
      ":isActive": data.isActive ?? "inactive",
      ":lastLogin": new Date().toISOString(),
      ":usernameSub": data.usernameSub ?? null,
    },
    ExpressionAttributeNames: {
      "#r": "role",
    },

    ReturnValues: "ALL_NEW",
  };

  return await dynamoDb.update(params);
});

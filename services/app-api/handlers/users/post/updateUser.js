import handler from "../../../libs/handler-lib";
import dynamoDb from "../../../libs/dynamodb-lib";
import { obtainUserByEmail } from "./obtainUserByEmail";
import {
  authorizeAdmin,
  authorizeAdminOrUserWithEmail,
  authorizeAnyUser,
} from "../../../auth/authConditions";

export const main = handler(async (event, context) => {
  if (event.source === "serverless-plugin-warmup") return null;

  await authorizeAnyUser(event);

  const data = JSON.parse(event.body);
  const currentUser = await obtainUserByEmail(data.email);

  await authorizeAdminOrUserWithEmail(event, currentUser.Items[0].email);

  if (modifyingAnythingButAnEmptyStateList(data, currentUser.Items[0])) {
    await authorizeAdmin(event);
  }

  const params = {
    TableName:
      process.env.AUTH_USER_TABLE_NAME ?? process.env.AuthUserTableName,
    Key: {
      userId: currentUser["Items"][0].userId,
    },
    UpdateExpression:
      "SET username = :username, #r = :role, states = :states, lastLogin = :lastLogin, usernameSub = :usernameSub",
    ExpressionAttributeValues: {
      ":username": data.username,
      ":role": data.role,
      ":states": data.states ?? "",
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

function modifyingAnythingButAnEmptyStateList(incomingUser, existingUser) {
  if (incomingUser.username !== existingUser.username) return true;
  if (incomingUser.role !== existingUser.role) return true;
  if (incomingUser.usernameSub !== existingUser.usernameSub) return true;
  if (existingUser.states.length > 0) return true;
  return false;
}

import handler from "../../../libs/handler-lib";
import dynamoDb from "../../../libs/dynamodb-lib";
import { main as obtainUserByEmail } from "./obtainUserByEmail";
import { authorizeAdmin, authorizeAdminOrUserWithEmail, authorizeAnyUser } from "../../../auth/authConditions";

export const main = handler(async (event, context) => {
  if (event.source === "serverless-plugin-warmup") return null;

  await authorizeAnyUser(event);

  const data = JSON.parse(event.body);

  console.log("got data: ");
  console.log(data);

  const body = JSON.stringify({
    email: data.email,
  });

  const currentUser = await obtainUserByEmail({
    body: body,
  });

  await authorizeAdminOrUserWithEmail(event, currentUser.body.Items[0].email);

  if (modifyingAnythingButAnEmptyStateList(data, currentUser.body.Items[0])) {
    await authorizeAdmin(event);
  }

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

function modifyingAnythingButAnEmptyStateList (incomingUser, existingUser) {
  if (incomingUser.username !== existingUser.username) return true;
  if (incomingUser.role !== existingUser.role) return true;
  if (incomingUser.isActive !== existingUser.isActive) return true;
  if (incomingUser.usernameSub !== existingUser.usernameSub) return true;
  if (existingUser.states.length > 0) return true;
  return false;
}
import handler from "../../../libs/handler-lib";
import dynamoDb from "../../../libs/dynamodb-lib";
import { main as obtainUserByEmail } from "./obtainUserByEmail";

export const main = handler(async (event, context) => {
  if (event.source === "serverless-plugin-warmup") return null;

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
      "SET #r = :role, states = :states, isActive = :isActive, lastLogin = :lastLogin",
    ExpressionAttributeValues: {
      ":role": data.role,
      ":states": data.states ?? "",
      ":isActive": data.isActive ?? "inactive",
      ":lastLogin": data.lastLogin,
    },
    ExpressionAttributeNames: {
      "#r": "role",
    },

    ReturnValues: "ALL_NEW",
  };

  const result = await dynamoDb.update(params);
  return result;
});

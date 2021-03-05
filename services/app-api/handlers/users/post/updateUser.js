import handler from "../../../libs/handler-lib";
import dynamoDb from "../../../libs/dynamodb-lib";

export const main = handler(async (event, context) => {
  // If this invokation is a prewarm, do nothing and return.
  if (event.source == "serverless-plugin-warmup") {
    console.log("Warmed up!");
    return null;
  }

  const data = JSON.parse(event.body);

  const params = {
    TableName:
      process.env.AUTH_USER_TABLE_NAME ?? process.env.AuthUserTableName,
    Key: {
      userId: data.userId,
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

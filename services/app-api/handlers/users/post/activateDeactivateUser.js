import handler from "../../../libs/handler-lib";
import dynamoDb from "../../../libs/dynamodb-lib";
import { authorizeAdmin } from "../../../auth/authConditions";

export const main = handler(async (event, context) => {
  // If this invokation is a prewarm, do nothing and return.
  if (event.source == "serverless-plugin-warmup") {
    console.log("Warmed up!");
    return null;
  }

  await authorizeAdmin(event);

  const data = JSON.parse(event.body);

  const params = {
    TableName:
      process.env.AUTH_USER_TABLE_NAME ?? process.env.AuthUserTableName,
    Key: {
      userId: data.userId,
    },
    // 'UpdateExpression' defines the attributes to be updated
    // 'ExpressionAttributeValues' defines the value in the update expression
    UpdateExpression: "SET isActive = :isActive",
    ExpressionAttributeValues: {
      ":isActive": data.isActive,
    },
    // 'ReturnValues' specifies if and how to return the item's attributes,
    // where ALL_NEW returns all attributes of the item after the update; you
    // can inspect 'result' below to see how it works with different settings
    ReturnValues: "UPDATED_NEW",
  };

  await dynamoDb.update(params);

  return { status: true };
});

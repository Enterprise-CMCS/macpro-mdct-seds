import handler from "../../../libs/handler-lib";
import dynamoDb from "../../../libs/dynamodb-lib";

export const main = handler(async (event, context) => {
  // If this invocation is a prewarm, do nothing and return.
  if (event.source === "serverless-plugin-warmup") {
    console.log("Warmed up!");
    return null;
  }

  let data = JSON.parse(event.body);

  console.log("~~~~~>" + data.email);

  const params = {
    TableName:
      process.env.AUTH_USER_TABLE_NAME ?? process.env.AuthUserTableName,
    Select: "ALL_ATTRIBUTES",
    ExpressionAttributeValues: {
      ":email": data.email,
    },
    FilterExpression: "email = :email",
  };

  const result = await dynamoDb.scan(params);

  console.log(result);

  if (result.Count === 0) {
    return false;
  }

  // Return the retrieved item
  return result;
});

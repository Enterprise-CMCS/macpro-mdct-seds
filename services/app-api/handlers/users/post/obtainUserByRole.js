import handler from "../../../libs/handler-lib";
import dynamoDb from "../../../libs/dynamodb-lib";

export const main = handler(async (event, context) => {
  // If this invocation is a prewarm, do nothing and return.
  if (event.source === "serverless-plugin-warmup") {
    console.log("Warmed up!");
    return null;
  }

  let data = JSON.parse(event.body);

  const params = {
    TableName:
      process.env.AUTH_USER_TABLE_NAME ?? process.env.AuthUserTableName,
    Select: "ALL_ATTRIBUTES",
    ExpressionAttributeValues: {
      ":email": data.email,
    },
    ExpressionAttributeNames: {
        "#r": "role",
      },
    FilterExpression: "role = :role",
  };

  const result = await dynamoDb.scan(params);

  if (result.Count === 0) {
    return false;
  }
  console.log(result)
  // Return the retrieved item
  return result;
});
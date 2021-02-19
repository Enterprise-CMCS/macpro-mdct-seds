import handler from "./../../libs/handler-lib";
import dynamoDb from "./../../libs/dynamodb-lib";

export const main = handler(async (event, context) => {
  // If this invokation is a prewarm, do nothing and return.
  if (event.source == "serverless-plugin-warmup") {
    console.log("Warmed up!");
    return null;
  }

  const params = {
    TableName: process.env.AUTH_USER_TABLE_NAME,
    Key: {
      userId: event.pathParameters["id"],
    },
  };

  const result = await dynamoDb.get(params);

  if (!result.Item) {
    return false;
  }

  // Return the retrieved item
  return result.Item;
});

export const getUserByUsername = handler(async (event, context) => {
  // If this invokation is a prewarm, do nothing and return.
  if (event.source == "serverless-plugin-warmup") {
    console.log("Warmed up!");
    return null;
  }

  const data = JSON.parse(event.body);

  const params = {
    TableName: process.env.AUTH_USER_TABLE_NAME,
    Select: "ALL_ATTRIBUTES",
    ExpressionAttributeValues: {
      ":username": data.username,
    },
    FilterExpression: "username = :username",
  };

  const result = await dynamoDb.scan(params);

  if (result.Count === 0) {
    return "No user found";
  }

  // Return the retrieved item
  return result;
});

import handler from "../../../libs/handler-lib";
import dynamoDb from "../../../libs/dynamodb-lib";

export const main = handler(async (event) => {
  // If this invokation is a prewarm, do nothing and return.
  if (event.source == "serverless-plugin-warmup") {
    console.log("Warmed up!");
    return null;
  }

  const params = {
    TableName:
      process.env.AUTH_USER_TABLE_NAME ?? process.env.AuthUserTableName,
    Select: "ALL_ATTRIBUTES",
    ExpressionAttributeValues: {
      ":userId": event.pathParameters["id"],
    },
    FilterExpression: "userId = :userId",
  };

  const queryResult = await dynamoDb.scan(params);

  let returnResult;

  if (!queryResult["Items"]) {
    returnResult = {
      status: "error",
      message: "No user by specified id found",
    };
  } else {
    returnResult = {
      status: "success",
      data: queryResult["Items"][0],
    };
  }

  return returnResult;
});

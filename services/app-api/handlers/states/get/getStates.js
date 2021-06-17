import handler from "../../../libs/handler-lib";
import dynamoDb from "../../../libs/dynamodb-lib";

export const main = handler(async (event, context) => {
  // If this invokation is a prewarm, do nothing and return.
  if (event.source == "serverless-plugin-warmup") {
    console.log("Warmed up!");
    return null;
  }

  const params = {
    TableName: process.env.StatesTableName,
    Select: "ALL_ATTRIBUTES",
  };

  const result = await dynamoDb.scan(params);

  if (result.Count === 0) {
    throw new Error("Get States query failed");
  }

  return result.Items;
});

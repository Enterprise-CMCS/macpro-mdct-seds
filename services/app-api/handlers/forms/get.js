import handler from "./../../libs/handler-lib";
import dynamoDb from "./../../libs/dynamodb-lib";

export const main = handler(async (event, context) => {
  // If this invokation is a prewarm, do nothing and return.
  if (event.source == "serverless-plugin-warmup") {
    console.log("Warmed up!");
    return null;
  }

  const data = JSON.parse(event.body);

  const params = {
    TableName: process.env.STATE_FORMS_TABLE_NAME,
  };

  const result = await dynamoDb.get(params);

  if (!result.Item) {
    throw new Error("Single form not found.");
  }

  // Return the retrieved item
  return result.Item;
});

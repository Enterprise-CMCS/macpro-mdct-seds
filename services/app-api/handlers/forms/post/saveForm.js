import handler from "../../../../libs/handler-lib";
import dynamoDb from "../../../../libs/dynamodb-lib";

/**
 * This handler will loop through a question array and save each row
 */

export const main = handler(async (event, context) => {
  // If this invokation is a prewarm, do nothing and return.
  if (event.source == "serverless-plugin-warmup") {
    console.log("Warmed up!");
    return null;
  }

  const data = JSON.parse(event.body);
  let a;

  const params = {
    TableName: process.env.FormsTableName,
  };

  const result = await dynamoDb.updateItem(params);

  if (result.Count === 0) {
    throw new Error("Form type query failed");
  }

  return result.Items;
});

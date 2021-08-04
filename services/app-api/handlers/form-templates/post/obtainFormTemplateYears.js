import handler from "../../../libs/handler-lib";
import dynamoDb from "../../../libs/dynamodb-lib";

export const main = handler(async (event, context) => {
  // If this invokation is a prewarm, do nothing and return.
  if (event.source == "serverless-plugin-warmup") {
    console.log("Warmed up!");
    return null;
  }

  const params = {
    TableName:
      process.env.FORM_TEMPLATES_TABLE_NAME ??
      process.env.FormTemplatesTableName,
    ExpressionAttributeNames: {
      "#theYear": "year",
    },
    ProjectionExpression: "#theYear",
  };

  const result = await dynamoDb.scan(params);

  if (result.Count === 0) {
    return [];
  }

  const resultsArray = result.Items.map((i) => i.year);

  return resultsArray.sort((a, b) => b - a);
});

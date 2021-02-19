import handler from "./../../libs/handler-lib";
import dynamoDb from "./../../libs/dynamodb-lib";

export const main = handler(async (event, context) => {
  // If this invokation is a prewarm, do nothing and return.
  console.log("EVVVVEEEEENNNNTTTTT", event);
  if (event.source == "serverless-plugin-warmup") {
    console.log("Warmed up!");
    return null;
  }

  const params = {
    TableName: process.env.STATE_FORMS_TABLE_NAME,
    Select: "ALL_ATTRIBUTES",
    ExpressionAttributeNames: {
      "#theYear": "year",
    },
    ExpressionAttributeValues: {
      ":stateId": event.pathParameters["stateId"],
      ":specifiedYear": parseInt(event.pathParameters["specifiedYear"]),
      ":quarter": parseInt(event.pathParameters["quarter"]),
    },
      FilterExpression:
      "state_id = :stateId and quarter = :quarter and #theYear = :specifiedYear",
  };
  const result = await dynamoDb.scan(params);
  if (!result) {
    throw new Error("No state form list found");
  }
  // Return the matching list of items in response body
  return result.Items;
});

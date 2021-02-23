import handler from "./../../libs/handler-lib";
import dynamoDb from "./../../libs/dynamodb-lib";

export const main = handler(async (event) => {
  // If this invokation is a prewarm, do nothing and return.
  if (event.source == "serverless-plugin-warmup") {
                console.log("Warmed up!");
    return null;
  }

  const params = {
    TableName: process.env.StateFormsTableName,
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
  if (result.Count === 0) {
    throw new Error(
      "No state form list found for this state, year, and quarter"
    );
  }
  // Return the matching list of items in response body
  return result.Items;
});

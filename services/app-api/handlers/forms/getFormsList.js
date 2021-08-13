import handler from "./../../libs/handler-lib";
import { recursiveScan } from "../shared/sharedFunctions";

export const main = handler(async (event, context) => {
  // If this invokation is a prewarm, do nothing and return.
  if (event.source == "serverless-plugin-warmup") {
    console.log("Warmed up!");
    return null;
  }

  const params = {
    TableName:
      process.env.STATE_FORMS_TABLE_NAME ?? process.env.StateFormsTableName,
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

  // Recursively call scan to get all results
  const result = await recursiveScan(params);

  // Return the matching list of items in response body
  return result;
});

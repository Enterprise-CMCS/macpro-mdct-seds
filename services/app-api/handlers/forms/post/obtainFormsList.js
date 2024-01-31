import handler from "../../../libs/handler-lib";
import dynamoDb from "../../../libs/dynamodb-lib";
import { authorizeAdminOrUserForState } from "../../../auth/authConditions";

export const main = handler(async (event, context) => {
  // If this invokation is a prewarm, do nothing and return.
  if (event.source === "serverless-plugin-warmup") {
    console.log("Warmed up!");
    return null;
  }

  const data = JSON.parse(event.body);

  await authorizeAdminOrUserForState(event, data.state);
  
  const startKey = data.startKey;

  const params = {
    TableName:
      process.env.STATE_FORMS_TABLE_NAME ?? process.env.StateFormsTableName,
    Select: "ALL_ATTRIBUTES",
    ExpressionAttributeNames: {
      "#theYear": "year",
    },

    ExpressionAttributeValues: {
      ":state": data.state,
      ":year": parseInt(data.year),
      ":quarter": parseInt(data.quarter),
    },
    FilterExpression:
      "state_id = :state and quarter = :quarter and #theYear = :year",
  };

  // If startKey exists, start the scan from this position
  if (startKey) {
    params.ExclusiveStartKey = startKey;
  }

  return await dynamoDb.scan(params);
});

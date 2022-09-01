import handler from "../../../libs/handler-lib";
import { recursiveScan } from "../../shared/sharedFunctions";

/**
 * Returns list of all forms based on state
 * This can be used for displaying a list of years and quarters available
 */

export const main = handler(async (event, context) => {
  // *** if this invocation is a pre-warm, do nothing and return
  if (event.source === "serverless-plugin-warmup") {
    console.log("Warmed up!");
    return null;
  }

  let data = JSON.parse(event.body);

  const params = {
    TableName:
      process.env.STATE_FORMS_TABLE_NAME ?? process.env.StateFormsTableName,
    Select: "ALL_ATTRIBUTES",
    ExpressionAttributeValues: {
      ":stateId": data.stateId,
    },
    FilterExpression: "state_id = :stateId",
    ConsistentRead: true,
  };
  const result = await recursiveScan(params);
  if (result.Count === 0) {
    throw new Error("No state form list found for this state");
  }
  // Return the matching list of items in response body
  return result.Items;
});

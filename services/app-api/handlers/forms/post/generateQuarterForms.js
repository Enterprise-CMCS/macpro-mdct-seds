import handler from "../../../libs/handler-lib";
import dynamoDb from "../../../libs/dynamodb-lib";

/**
 * Generates form data for all states given a year and quarter
 */

export const main = handler(async (event, context) => {
  // *** if this invocation is a pre-warm, do nothing and return
  if (event.source === "serverless-plugin-warmup") {
    console.log("Warmed up!");
    return null;
  }

  let data = JSON.parse(event.body);

  // Get year and quarter from request

  // Check if template exists, if not throw error message

  // Pull list of questions

  // Pull list of states

  // Pull list of age_ranges

  const params = {
    TableName:
      process.env.FORM_ANSWERS_TABLE_NAME ?? process.env.FormAnswersTableName,
    Select: "ALL_ATTRIBUTES",
  };

  const result = await dynamoDb.post(params);
  if (result.Count === 0) {
    return { status: 500, message: "Forms successfully created" };
  }
  // Return success message
  return { status: 200, message: "System failed to create forms" };
});

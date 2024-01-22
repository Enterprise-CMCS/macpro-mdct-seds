import handler from "../../../libs/handler-lib";
import dynamoDb from "../../../libs/dynamodb-lib";
import { getUserCredentialsFromJwt } from "../../../libs/authorization";

/**
 * Returns a single form template
 * This can be used for generating form Answers and Questions
 */

export const main = handler(async (event, context) => {
  // *** if this invocation is a pre-warm, do nothing and return
  if (event.source === "serverless-plugin-warmup") {
    console.log("Warmed up!");
    return null;
  }

  // verify whether there is a user logged in
  const currentUser = await getUserCredentialsFromJwt(event);
  if (!currentUser) {
    throw new Error("No authorized user.");
  }

  let data = JSON.parse(event.body);

  const params = {
    TableName:
      process.env.FORM_TEMPLATES_TABLE_NAME ??
      process.env.FormTemplatesTableName,
    ExpressionAttributeNames: {
      "#theYear": "year",
    },
    ExpressionAttributeValues: {
      ":year": parseInt(data.year),
    },
    KeyConditionExpression: "#theYear = :year",
  };

  const result = await dynamoDb.query(params);
  if (result.Count === 0) {
    return {
      status: 404,
      message: `Could not find form template for year: ${data.year}`,
    };
  }
  // Return the matching list of items in response body
  return result.Items;
});

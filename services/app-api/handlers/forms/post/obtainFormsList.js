import handler from "../../../libs/handler-lib";
import dynamoDb from "../../../libs/dynamodb-lib";
import { getUserCredentialsFromJwt } from "../../../libs/authorization";

export const main = handler(async (event, context) => {
  // verify whether there is a user logged in
  const currentUser = await getUserCredentialsFromJwt(event);
  if (!currentUser) {
    throw new Error("No authorized user.");
  }

  const data = JSON.parse(event.body);

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

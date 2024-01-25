import handler from "../../../libs/handler-lib";
import dynamoDb from "../../../libs/dynamodb-lib";
import { getUserCredentialsFromJwt } from "../../../libs/authorization";

export const main = handler(async (event, context) => {
  // verify whether there is a user logged in
  const currentUser = await getUserCredentialsFromJwt(event);
  if (!currentUser) {
    throw new Error("No authorized user.");
  }

  // Get year and quarter from request
  const data = JSON.parse(event.body);

  const stateFormId = `${data.state}-${data.year}-${data.quarter}-${data.form}`;

  const params = {
    TableName:
      process.env.STATE_FORMS_TABLE_NAME ?? process.env.StateFormsTableName,
    Select: "ALL_ATTRIBUTES",
    ExpressionAttributeValues: {
      ":state_form": stateFormId,
    },
    KeyConditionExpression: "state_form = :state_form",
    ConsistentRead: true,
  };

  const result = await dynamoDb.query(params);
  if (result.Count === 0) {
    return [];
  }

  const record = result.Items[0];
  if (record.form === "21E") {
    record.enrollmentCounts = {
      type: "separate",
      year: data.year,
      count: data.totalEnrollment,
    };
  }
  if (record.form === "64.21E") {
    record.enrollmentCounts = {
      type: "expansion",
      year: data.year,
      count: data.totalEnrollment,
    };
  }
  const putItem = { ...record, lastSynced: new Date().toISOString() };

  const paramsPut = {
    TableName:
      process.env.STATE_FORMS_TABLE_NAME ?? process.env.StateFormsTableName,
    Item: putItem,
  };

  try {
    await dynamoDb.put(paramsPut);
  } catch (e) {
    throw new Error("Table params update failed:" + e.message);
  }

  return {
    status: 200,
    message: "Enrollment Data successfully updated",
  };
});

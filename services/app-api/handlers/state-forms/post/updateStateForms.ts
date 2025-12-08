import handler from "../../../libs/handler-lib.ts";
import dynamoDb from "../../../libs/dynamodb-lib.ts";
import { authorizeUserForState } from "../../../auth/authConditions.ts";

export const main = handler(async (event, context) => {
  // Get year and quarter from request
  let data = JSON.parse(event.body);

  await authorizeUserForState(event, data.state);

  const stateFormId = `${data.state}-${data.year}-${data.quarter}-${data.form}`;

  const params = {
    TableName: process.env.StateFormsTable,
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

  const record = result.Items![0];
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
    TableName: params.TableName,
    Item: putItem,
  };

  try {
    await dynamoDb.put(paramsPut);
  } catch (e) {
    throw new Error("Table params update failed", { cause: e });
  }

  return {
    status: 200,
    message: "Enrollment Data successfully updated",
  };
});

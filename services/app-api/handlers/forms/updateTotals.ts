import handler from "../../libs/handler-lib.ts";
import dynamoDb from "../../libs/dynamodb-lib.ts";
import { authorizeUserForState } from "../../auth/authConditions.ts";
import { APIGatewayProxyEvent } from "../../shared/types.ts";
import { notFound, ok } from "../../libs/response-lib.ts";

export const main = handler(async (event: APIGatewayProxyEvent) => {
  const { state, year, quarter, form } = event.pathParameters!;
  const data = JSON.parse(event.body!);

  await authorizeUserForState(event, state);

  const stateFormId = `${state}-${year}-${quarter}-${form}`;

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
  if (result.Items.length === 0) {
    return notFound();
  }

  const record = result.Items[0];
  if (record.form === "21E") {
    record.enrollmentCounts = {
      type: "separate",
      year,
      count: data.totalEnrollment,
    };
  }
  if (record.form === "64.21E") {
    record.enrollmentCounts = {
      type: "expansion",
      year,
      count: data.totalEnrollment,
    };
  }
  record.lastSynced = new Date().toISOString();

  await dynamoDb.put({
    TableName: params.TableName,
    Item: record,
  });

  return ok();
});

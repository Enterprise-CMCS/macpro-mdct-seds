import handler from "../../../libs/handler-lib";
import dynamoDb from "../../../libs/dynamodb-lib";

export const main = handler(async (event, context) => {
  // If this invokation is a prewarm, do nothing and return.
  if (event.source == "serverless-plugin-warmup") {
    console.log("Warmed up!");
    return null;
  }

  // Get year and quarter from request
  let data = JSON.parse(event.body);

  const stateFormId = `${data.state}-${data.year}-4-${data.form}`;

  const params = {
    TableName: process.env.STATE_FORMS_TABLE_NAME,
    Select: "ALL_ATTRIBUTES",
    ExpressionAttributeValues: {
      ":state_form": stateFormId,
    },
    FilterExpression: "state_form = :state_form",
    ConsistentRead: true,
  };

  const result = await dynamoDb.scan(params);

  if (result.Count === 0) {
    throw new Error("Cannot find matching record");
  }

  const record = result.Items[0];
  const putItem = record;
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

  const paramsPut = {
    TableName: process.env.STATE_FORMS_TABLE_NAME,
    Item: putItem,
  };

  await dynamoDb.put(paramsPut);

  return {
    status: 200,
    message: "Enrollment Data successfully updated",
  };
});
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
  console.log("ZzzStateFormId", stateFormId);

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
    record.separateChildCount = {
      year: data.year,
      count: data.totalEnrollment,
    };
  }
  if (record.form === "64.21E") {
    record.expansionChildCount = {
      year: data.year,
      count: data.totalEnrollment,
    };
  }

  const paramsPut = {
    TableName: process.env.STATE_FORMS_TABLE_NAME,
    Item: putItem,
  };

  const resultPut = await dynamoDb.put(paramsPut);

  console.log("zzzResultPut");
  // if (resultPut.Count === 0) {
  //   throw new Error("Cannot find matching record");
  // }

  return {
    status: 200,
    message: "Enrollment Data successfully updated",
  };
});

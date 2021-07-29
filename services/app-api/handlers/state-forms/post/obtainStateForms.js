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

  const stateForms = data.forms;

  // Build expression Attribute Value object
  const expressionAttributeValuesObject = () => {
    const returnObject = {};
    for (const i in stateForms) {
      const key = `:form_${i}`;
      returnObject[key] = stateForms[i];
    }
    return returnObject;
  };

  const expressionValues = expressionAttributeValuesObject();

  // Build filter expression
  const filterExpressionString = () => {
    let returnString = "";
    for (const i in expressionValues) {
      if (i === ":form_0") {
        returnString += `form = ${i} `;
      } else {
        returnString += `OR form = ${i} `;
      }
    }

    return returnString;
  };

  const params = {
    TableName:
      process.env.STATE_FORMS_TABLE_NAME ?? process.env.StateFormsTableName,
    Select: "ALL_ATTRIBUTES",
    ExpressionAttributeValues: { ...expressionAttributeValuesObject() },
    FilterExpression: filterExpressionString(),
    ConsistentRead: true,
  };

  const result = await dynamoDb.scan(params);

  if (result.Count === 0) {
    throw new Error("Cannot find matching state forms");
  }

  return {
    status: 200,
    message: "Enrollment Data successfully updated",
    entries: result.Items,
  };
});

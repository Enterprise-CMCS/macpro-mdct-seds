import handler from "../../../libs/handler-lib";
import dynamoDb from "../../../libs/dynamodb-lib";

export const main = handler(async (event, context) => {
  // If this invocation is a prewarm, do nothing and return.
  if (event.source === "serverless-plugin-warmup") {
    console.log("Warmed up!");
    return null;
  }

  const isJsonString = (jsonString) => {
    try {
      // try to stringify and parse the incoming data to verify if valid json
      let o = JSON.parse(JSON.stringify(jsonString));

      if (o && typeof o === "object") {
        return o;
      }
    } catch (e) {
      return false;
    }

    return false;
  };

  const data = JSON.parse(event.body);

  if (!data.year || !data.template) {
    return {
      status: 422,
      message: `Please specify both a year and a template`,
    };
  }
  console.log("zzzData.template", data.template[0]);
  if (!isJsonString(data.template[0])) {
    return {
      status: 400,
      message: `Invalid JSON. Please review your template.`,
    };
  }

  const params = {
    TableName:
      process.env.FORM_TEMPLATES_TABLE_NAME ??
      process.env.FormTemplatesTableName,
    Item: {
      year: parseInt(data.year),
      template: data.template,
    },
  };

  await dynamoDb.put(params);

  return {
    status: 200,
    message: `Template updated for ${data.year}!`,
  };
});

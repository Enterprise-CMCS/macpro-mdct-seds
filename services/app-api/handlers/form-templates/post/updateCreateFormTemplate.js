import handler from "../../../libs/handler-lib";
import dynamoDb from "../../../libs/dynamodb-lib";
import { getUserCredentialsFromJwt } from "../../../libs/authorization";

export const main = handler(async (event, context) => {
  // verify whether there is a user logged in
  const currentUser = await getUserCredentialsFromJwt(event);
  if (!currentUser) {
    throw new Error("No authorized user.");
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
      lastSynced: new Date().toISOString(),
    },
  };

  await dynamoDb.put(params);

  return {
    status: 200,
    message: `Template updated for ${data.year}!`,
  };
});

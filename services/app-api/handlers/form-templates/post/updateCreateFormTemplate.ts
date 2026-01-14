import handler from "../../../libs/handler-lib.ts";
import dynamoDb from "../../../libs/dynamodb-lib.ts";
import { authorizeAdmin } from "../../../auth/authConditions.ts";
import { ok, badRequest } from "../../../libs/response-lib.ts";

export const main = handler(async (event) => {
  await authorizeAdmin(event);

  const isJsonString = (jsonString: any) => {
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
    return badRequest({
      status: 422,
      message: `Please specify both a year and a template`,
    });
  }

  if (!isJsonString(data.template[0])) {
    return badRequest({
      status: 400,
      message: `Invalid JSON. Please review your template.`,
    });
  }

  const params = {
    TableName: process.env.FormTemplatesTable,
    Item: {
      year: parseInt(data.year),
      template: data.template,
      lastSynced: new Date().toISOString(),
    },
  };

  await dynamoDb.put(params);

  return ok({
    status: 200,
    message: `Template updated for ${data.year}!`,
  });
});

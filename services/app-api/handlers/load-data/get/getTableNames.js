import handler from "../../../libs/handler-lib";
import dynamoDb from "../../../libs/dynamodb-lib";

export const main = handler(async (event, context) => {
  if (event.source === "serverless-plugin-warmup") return null;

  const params = {};

  const result = await dynamoDb.listTables(params);
  const tables = [];

  result["TableNames"].forEach((tableName) => {
    tables.push({
      value: tableName,
      label: tableName,
    });
  });

  return tables;
});

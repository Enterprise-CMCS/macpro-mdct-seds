import handler from "../../../libs/handler-lib";
import dynamoDb from "../../../libs/dynamodb-lib";

export const main = handler(async (event, context) => {
  const params = {
    TableName: process.env.FormsTableName,
    Select: "ALL_ATTRIBUTES",
  };

  const result = await dynamoDb.scan(params);

  if (result.Count === 0) {
    return [];
  }

  return result.Items;
});

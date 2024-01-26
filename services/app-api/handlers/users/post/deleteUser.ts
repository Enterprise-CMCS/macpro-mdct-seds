import handler from "../../../libs/handler-lib";
import dynamoDb from "../../../libs/dynamodb-lib";

/**
 * Note that this function is not exposed via the API;
 * it is only executable by someone with AWS access, like a dev.
 */
export const main = handler(async (event, context) => {
  const data = JSON.parse(event.body);

  const params = {
    TableName:
      process.env.AUTH_USER_TABLE_NAME ?? process.env.AuthUserTableName,
    Key: {
      userId: data.id,
    },
  };

  await dynamoDb.delete(params);

  return { status: true };
});

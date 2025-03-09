import handler from "../../../libs/handler-lib.js";
import dynamoDb from "../../../libs/dynamodb-lib.js";

export const main = handler(async (event, context) => {
  const data = JSON.parse(event.body);

  const params = {
    TableName: process.env.AuthUserTable,
    Key: {
      userId: data.id,
    },
  };

  await dynamoDb.delete(params);

  return { status: true };
});

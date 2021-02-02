import * as uuid from "uuid";
import handler from "./../libs/handler-lib";
import dynamoDb from "./../libs/dynamodb-lib";

export const main = handler(async (event, context) => {
  // If this invokation is a prewarm, do nothing and return.
  if (event.source == "serverless-plugin-warmup") {
    console.log("Warmed up!");
    return null;
  }
  const data = JSON.parse(event.body);
  console.log(JSON.stringify(event, null, 2));

  const nextValue = await dynamoDb
    .increment(data.territory)
    .done(function (value) {})
    .fail(function (error) {
      console.log(error);
    });

  const params = {
    // TableName: process.env.tableName,
    TableName: "local-user-auth",
    Item: {
      userId: "1",
      "first-name": "andrew",
    },
  };

  await dynamoDb.put(params);

  return params.Item;
});

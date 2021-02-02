import handler from "./../../libs/handler-lib";
import dynamoDb from "./../../libs/dynamodb-lib";

export const main = handler(async (event, context) => {
  // If this invokation is a prewarm, do nothing and return.
  if (event.source == "serverless-plugin-warmup") {
    console.log("Warmed up!");
    return null;
  }

  console.log("zzzEvent", event);
  const data = JSON.parse(event.body);
  // const data = event.body;
  // return data;
  console.log(JSON.stringify(event, null, 2));

  //Query to get next available userId
  const paramsForId = {
    TableName: process.env.AUTH_USER_TABLE_NAME,
  };
  const allResults = await dynamoDb.scan(paramsForId);

  // Check for result Items
  if (Array.isArray(allResults.Items)) {
    // Sort Alphabetically by userId
    allResults.Items.sort((a, b) =>
      parseInt(a.userId) > parseInt(b.userId) ? -1 : 1
    );
  }
  const newUserId = parseInt(allResults.Items[0].userId) + 1;

  const params = {
    TableName: process.env.AUTH_USER_TABLE_NAME,
    Item: {
      userId: newUserId.toString(),
      isSuperUser: "true",
      username: data.username,
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      isActive: "true",
      dateJoined: Date.now(),
    },
  };

  await dynamoDb.put(params);

  return params.Item;
});

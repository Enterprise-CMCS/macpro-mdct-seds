import handler from "../../../libs/handler-lib";
import dynamoDb from "../../../libs/dynamodb-lib";
import { main as obtainUserByUsername } from "./obtainUserByUsername";

export const main = handler(async (event, context) => {
  // If this invokation is a prewarm, do nothing and return.
  if (event.source == "serverless-plugin-warmup") {
    console.log("Warmed up!");
    return null;
  }

  const data = JSON.parse(event.body);

  console.log(JSON.stringify(event, null, 2));

  if (!data.username) {
    return `Please enter a username`;
  }

  console.log("zzzData", data);
  // Stringify body contents to match api type
  const body = JSON.stringify({
    username: data.username,
  });

  const currentUser = await obtainUserByUsername({
    body: body,
  });

  if (currentUser.body !== "false") {
    return `User ${data.username} already exists`;
  }

  // Query to get next available userId
  const paramsForId = {
    TableName:
      process.env.AUTH_USER_TABLE_NAME ?? process.env.AuthUserTableName,
  };
  const allResults = await dynamoDb.scan(paramsForId);

  let newUserId = 0;
  // Check for result Items
  if (Array.isArray(allResults.Items)) {
    // Sort Alphabetically by userId
    allResults.Items.sort((a, b) =>
      parseInt(a.userId) > parseInt(b.userId) ? -1 : 1
    );

    if (allResults.Items[0]) {
      newUserId = parseInt(allResults.Items[0].userId) + 1;
    }
  }

  const params = {
    TableName:
      process.env.AUTH_USER_TABLE_NAME ?? process.env.AuthUserTableName,
    Item: {
      dateJoined: new Date().toISOString(),
      email: data.email,
      firstName: data.firstName,
      lastName: data.lastName,
      isActive: "true",
      isSuperUser: "true",
      role: data.role,
      states: data.states ?? "",
      userId: newUserId.toString(),
      username: data.username,
      lastLogin: data.lastLogin ? data.lastLogin : "",
    },
    ConditionExpression: "attribute_not_exists(username)",
  };

  await dynamoDb.put(params, (err, data) => {
    if (err) throw err;
    return { status: "success", messgage: `User ${data.username} Added!` };
  });
});

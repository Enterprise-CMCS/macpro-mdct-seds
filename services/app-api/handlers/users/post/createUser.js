import handler from "../../../libs/handler-lib";
import dynamoDb from "../../../libs/dynamodb-lib";
import { authorizeAdmin, authorizeAnyUser } from "../../../auth/authConditions";
import { main as obtainUserByUsername } from "./obtainUserByUsername";

export const main = handler(async (event, context) => {
  // If this invocation is a prewarm, do nothing and return.
  if (event.source === "serverless-plugin-warmup") {
    console.log("Warmed up!");
    return null;
  }

  const userData = getUserDetailsFromEvent(event);

  return await createUser(userData);
});

export const adminCreateUser = handler(async (event, context) => {
  // If this invocation is a prewarm, do nothing and return.
  if (event.source === "serverless-plugin-warmup") {
    console.log("Warmed up!");
    return null;
  }

  await authorizeAdmin(event);

  const userData = JSON.parse(event.body);

  return await createUser(userData);
});

const createUser = async (userData) => {

  if (!userData.username) {
    return `Please enter a username`;
  }

  // Stringify body contents to match api type
  const body = JSON.stringify({
    username: userData.username,
  });

  const currentUser = await obtainUserByUsername({
    body: body,
  });

  if (currentUser.body !== "false") {
    return `User ${userData.username} already exists`;
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
      email: userData.email,
      firstName: userData.firstName,
      lastName: userData.lastName,
      isActive: "true",
      isSuperUser: "true",
      role: userData.role,
      states: [],
      userId: newUserId.toString(),
      username: userData.username,
      usernameSub: userData.usernameSub,
      lastLogin: new Date().toISOString(),
      lastSynced: new Date().toISOString(),
    },
  };

  await dynamoDb.put(params);

  return `User ${userData.username} Added!`;
};

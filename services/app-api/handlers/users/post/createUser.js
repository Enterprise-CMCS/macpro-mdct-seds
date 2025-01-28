import handler from "../../../libs/handler-lib.js";
import dynamoDb from "../../../libs/dynamodb-lib.js";
import { obtainUserByUsername } from "./obtainUserByUsername.js";
import { getUserDetailsFromEvent } from "../../../libs/authorization.js";

export const main = handler(async (event, context) => {
  const userData = await getUserDetailsFromEvent(event);

  return await createUser(userData);
});

const createUser = async (userData) => {
  if (!userData.username) {
    return `Please enter a username`;
  }

  const currentUser = await obtainUserByUsername(userData.username);

  if (currentUser) {
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

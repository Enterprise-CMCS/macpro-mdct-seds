import handler from "../../../libs/handler-lib.ts";
import dynamoDb from "../../../libs/dynamodb-lib.ts";
import { getUserDetailsFromEvent } from "../../../libs/authorization.ts";
import { scanForUserByUsername } from "../../../storage/users.ts";
import { ok } from "../../../libs/response-lib.ts";

export const main = handler(async (event) => {
  const userData = await getUserDetailsFromEvent(event);

  return ok(await createUser(userData));
});

export const createUser = async (userData: any) => {
  if (!userData.username) {
    return `Please enter a username`;
  }

  const currentUser = await scanForUserByUsername(userData.username);

  if (currentUser) {
    return `User ${userData.username} already exists`;
  }

  // Query to get next available userId
  const paramsForId = {
    TableName: process.env.AuthUserTable,
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
    TableName: process.env.AuthUserTable,
    Item: {
      dateJoined: new Date().toISOString(),
      email: userData.email,
      firstName: userData.firstName,
      lastName: userData.lastName,
      role: userData.role,
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

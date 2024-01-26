import handler from "../../../libs/handler-lib";
import dynamoDb from "../../../libs/dynamodb-lib";
import { getUserCredentialsFromJwt } from "../../../libs/authorization";

export const main = handler(async (event, context) => {
  // verify whether there is a user logged in
  const user = await getUserCredentialsFromJwt(event);
  if (!user) {
    throw new Error("No authorized user.");
  }

  const data = JSON.parse(event.body);

  if (!data.username) {
    return `Please enter a username`;
  }

  if (await usernameIsInUse(data.username)) {
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
      states: data.states ?? [],
      userId: newUserId.toString(),
      username: data.username,
      usernameSub: data.sub,
      lastLogin: data.lastLogin ? data.lastLogin : "",
      lastSynced: new Date().toISOString(),
    },
  };

  await dynamoDb.put(params);

  return `User ${data.username} Added!`;
});

const usernameIsInUse = async (username: string) => {
  const params = {
    TableName:
      process.env.AUTH_USER_TABLE_NAME ?? process.env.AuthUserTableName,
    Select: "ALL_ATTRIBUTES",
    ExpressionAttributeValues: {
      ":username": username,
    },
    FilterExpression: "username = :username",
  };

  const result = await dynamoDb.scan(params);

  return result.Count > 0;
}

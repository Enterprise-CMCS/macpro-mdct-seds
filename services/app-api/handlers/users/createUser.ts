import dynamoDb from "../../libs/dynamodb-lib.ts";
import { putUser, scanForUserByUsername } from "../../storage/users.ts";

export const createUser = async (userData: any) => {
  if (!userData.username) {
    return `Please enter a username`;
  }

  const conflictingUser = await scanForUserByUsername(userData.username);
  if (conflictingUser) {
    return `User ${userData.username} already exists`;
  }

  const params = { TableName: process.env.AuthUserTable };
  const maxExistingId = ((await dynamoDb.scan(params)).Items ?? [])
    .map((user) => Number(user.userId))
    .reduce((max, id) => (max > id ? max : id), 0);

  const authUser = {
    dateJoined: new Date().toISOString(),
    email: userData.email,
    firstName: userData.firstName,
    lastName: userData.lastName,
    role: userData.role,
    userId: (maxExistingId + 1).toString(),
    username: userData.username,
    usernameSub: userData.usernameSub,
    lastLogin: new Date().toISOString(),
    lastSynced: new Date().toISOString(),
  };

  await putUser(authUser);

  return `User ${userData.username} Added!`;
};

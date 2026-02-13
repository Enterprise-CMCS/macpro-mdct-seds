import handler from "../../libs/handler-lib.ts";
import dynamoDb from "../../libs/dynamodb-lib.ts";
import { createUser } from "./createUser.ts";
import { AuthUser, scanForUserWithSub } from "../../storage/users.ts";
import { ok } from "../../libs/response-lib.ts";
import { emptyParser } from "../../libs/parsing.ts";
import { CmsUser } from "../../shared/types.ts";

/**
 * Get **or** create the AuthUser record matching this request's auth token.
 */
export const main = handler(emptyParser, async (request) => {
  // Only this endpoint receives a CmsUser (not an AuthUser) from handler-lib.
  const userFromToken = request.user as CmsUser;

  const usernameSub = userFromToken.usernameSub;
  if (!usernameSub) {
    throw new Error(`User token must contain a 'sub' property!`);
  }

  let userFromDb = await scanForUserWithSub(usernameSub);
  if (!userFromDb) {
    await createUser(userFromToken);
    userFromDb = await scanForUserWithSub(usernameSub);
    if (!userFromDb) {
      throw new Error(`Failed to create new AuthUser record!`);
    }
  } else {
    await recordLogin(userFromDb, userFromToken);
  }

  return ok(userFromDb);
});

/**
 * Record the fact that this user has logged in.
 * Also, ensure the AuthUser record stays up-to-date with Cognito.
 *
 * This endpoint will probably be called multiple times per user session,
 * so we're not recording "the moment of login" so much as "user activity".
 * The date usually matters more than the exact time,
 * so this is still valuable information.
 */
const recordLogin = async (authUser: AuthUser, userDetails: CmsUser) => {
  await dynamoDb.update({
    TableName: process.env.AuthUserTable,
    Key: { userId: authUser.userId },
    UpdateExpression:
      "SET firstName = :firstName, lastName = :lastName, email = :email, lastLogin = :lastLogin",
    ExpressionAttributeValues: {
      ":firstName": userDetails.firstName,
      ":lastName": userDetails.lastName,
      ":email": userDetails.email,
      ":lastLogin": new Date().toISOString(),
    },
  });
};

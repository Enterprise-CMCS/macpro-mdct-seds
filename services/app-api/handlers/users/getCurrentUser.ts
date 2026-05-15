import handler from "../../libs/handler-lib.ts";
import { createUser } from "./createUser.ts";
import { recordLogin, scanForUserWithSub } from "../../storage/users.ts";
import { ok } from "../../libs/response-lib.ts";
import { emptyParser } from "../../libs/parsing.ts";
import { CmsUser } from "../../shared/types.ts";

/**
 * Get **or** create the AuthUser record matching this request's auth token.
 */
export const main = handler(emptyParser, async (request) => {
  // Only this endpoint receives a CmsUser (not an AuthUser!) from handler-lib.
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
    await recordLogin(
      {
        userId: userFromDb.userId,
        ...userFromToken,
      },
      new Date().toISOString()
    );
  }

  return ok(userFromDb);
});

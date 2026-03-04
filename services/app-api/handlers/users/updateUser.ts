import handler from "../../libs/handler-lib.ts";
import { putUser, scanForUserWithSub } from "../../storage/users.ts";
import {
  badRequest,
  forbidden,
  notFound,
  ok,
} from "../../libs/response-lib.ts";
import { emptyParser, isStateAbbr } from "../../libs/parsing.ts";
import { logger } from "../../libs/debug-lib.ts";

export const main = handler(emptyParser, async (request) => {
  const { body, user: requestingUser } = request;

  if (!isValidBody(body)) {
    return badRequest();
  }

  const userBeingModified = await scanForUserWithSub(body.usernameSub);
  if (!userBeingModified) {
    return notFound(`User with sub ${body.usernameSub} could not be found.`);
  }

  if (requestingUser.role !== "admin") {
    if (
      userBeingModified.usernameSub !== requestingUser.usernameSub ||
      userBeingModified.role !== body.role ||
      userBeingModified.state !== undefined
    ) {
      // Non-admins can only change their own AuthUser record,
      // and even then only the state, and even then only if it was absent.
      return forbidden();
    }
  }

  const updatedUser = {
    ...userBeingModified,
    role: body.role,
    state: body.state,
  };

  await putUser(updatedUser);

  return ok(updatedUser);
});

type RequestBody = {
  usernameSub: string;
  role: "state" | "business" | "admin";
  state: string;
};

function isValidBody(body: unknown): body is RequestBody {
  if (!body || "object" !== typeof body) {
    logger.warn("Body is empty.");
    return false;
  }
  if (!("usernameSub" in body) || "string" !== typeof body.usernameSub) {
    logger.warn("body.usernameSub must be a string");
    return false;
  }
  if (
    !("role" in body) ||
    !["state", "business", "admin"].includes(body.role as string)
  ) {
    logger.warn("body.role must be 'state', 'business', or 'admin'.");
    return false;
  }
  if ("state" in body) {
    if ("string" !== typeof body.state || !isStateAbbr(body.state)) {
      logger.warn("body.state must be a 2-letter state abbreviation");
      return false;
    }
  }
  return true;
}

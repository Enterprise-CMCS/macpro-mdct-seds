import handler from "../../../libs/handler-lib.ts";
import { scanForUserWithSub } from "../get/getCurrentUser.ts";
import {
  authorizeAdmin,
  authorizeAdminOrUserWithEmail,
  authorizeAnyUser,
} from "../../../auth/authConditions.ts";
import { putUser, AuthUser } from "../../../storage/users.ts";
import { APIGatewayProxyEvent } from "../../../shared/types.ts";
import { notFound, ok } from "../../../libs/response-lib.ts";

export const main = handler(async (event: APIGatewayProxyEvent) => {
  await authorizeAnyUser(event);

  const data = JSON.parse(event.body!);
  const currentUser = await scanForUserWithSub(data.usernameSub);
  if (!currentUser) {
    return notFound(`User with sub ${data.usernameSub} could not be found`);
  }

  await authorizeAdminOrUserWithEmail(event, currentUser!.email);

  if (modifyingAnythingButAnUndefinedState(data, currentUser)) {
    await authorizeAdmin(event);
  }

  assertPayloadIsValid(data);

  const updatedUser = {
    ...currentUser,
    role: data.role,
    state: data.state,
  };

  await putUser(updatedUser);

  return ok(updatedUser);
});

function modifyingAnythingButAnUndefinedState(
  incomingUser: any,
  existingUser: AuthUser
) {
  if (incomingUser.username !== existingUser.username) return true;
  if (incomingUser.role !== existingUser.role) return true;
  if (incomingUser.usernameSub !== existingUser.usernameSub) return true;
  if (existingUser.state !== undefined) return true;
  return false;
}

function assertPayloadIsValid(data: any) {
  if (!data) {
    throw new Error("User update payload is missing");
  }

  if (typeof data.role !== "string" || !data.role) {
    throw new Error("Invalid user role - must be a nonempty string");
  }
  if (!["admin", "business", "state"].includes(data.role)) {
    throw new Error("Invalid user role - must be an existing role");
  }

  if (data.state !== undefined) {
    if (typeof data.state !== "string") {
      throw new Error("Invalid user state - must be a string");
    }
    if (!/^[A-Z]{2}$/.test(data.state)) {
      throw new Error("Invalid user state - must be 2-letter abbreviations");
    }
  }
}

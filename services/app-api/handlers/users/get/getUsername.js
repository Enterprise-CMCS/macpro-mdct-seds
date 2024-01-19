import handler from "../../../libs/handler-lib";
import { getCurrentUserInfo } from "../../../auth/cognito-auth";
import { getUserCredentialsFromJwt } from "../../../libs/authorization";

export const main = handler(async (event) => {
  // verify whether there is a user logged in
  const user = await getUserCredentialsFromJwt(event);
  if (!user) {
    throw new Error("No authorized user.");
  }

  let currentUser = await getCurrentUserInfo(event);
  return currentUser;
});

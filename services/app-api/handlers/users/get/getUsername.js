import handler from "../../../libs/handler-lib.js";
import { getCurrentUserInfo } from "../../../auth/cognito-auth.js";

export const main = handler(async (event) => {
  let currentUser = await getCurrentUserInfo(event);
  return currentUser;
});

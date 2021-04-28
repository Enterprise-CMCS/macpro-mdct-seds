import handler from "../../../libs/handler-lib";
import { getCurrentUserInfo } from "../../../auth/cognito-auth";

export const main = handler(async (event) => {
    let currentUser = await getCurrentUserInfo(event);
    return currentUser;
});
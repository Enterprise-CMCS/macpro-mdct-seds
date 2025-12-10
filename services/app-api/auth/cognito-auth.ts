import { getUserDetailsFromEvent } from "../libs/authorization.ts";
import { scanForUserWithSub } from "../handlers/users/get/getCurrentUser.ts";

export const getCurrentUserInfo = async (event) => {
  const user = await getUserDetailsFromEvent(event);
  const currentUser = await scanForUserWithSub(user.usernameSub);

  if (!currentUser) {
    return {
      data: {
        email: user.email,
        role: undefined,
        states: undefined,
      },
    };
  }
  return {
    status: "success",
    data: currentUser,
  };
};

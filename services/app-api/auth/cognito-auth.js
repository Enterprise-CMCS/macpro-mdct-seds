import { getUserDetailsFromEvent } from "../libs/authorization.js";
import { obtainUserByEmail } from "../handlers/users/post/obtainUserByEmail.js";

export const getCurrentUserInfo = async (event) => {
  const user = await getUserDetailsFromEvent(event);
  const currentUser = await obtainUserByEmail(user.email);

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
    data: currentUser["Items"][0],
  };
};

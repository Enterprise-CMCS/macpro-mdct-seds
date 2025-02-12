// import { getUserDetailsFromEvent } from "../libs/authorization.js";
import { obtainUserByEmail } from "../handlers/users/post/obtainUserByEmail.js";

export const getCurrentUserInfo = async (event) => {
  const user = {
    email: "stateuser@test.com",
    firstName: "Alicia",
    lastName: "States",
    role: "state",
    username: "stateuser@test.com",
    usernameSub: "04685448-a0d1-7064-101f-a164437229fd",
  };

  // await getUserDetailsFromEvent(event);
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

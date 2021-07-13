import { createUser, obtainUserByEmail, updateUser } from "../libs/api";
import { Auth } from "aws-amplify";
import { generateDateForDB } from "./transformFunctions";

export async function ascertainUserPresence(user) {
  const existingUser = await obtainUserByEmail({
    email: user.attributes.email
  });

  const userObject = {
    username: user.attributes.identities
      ? user.attributes.identities[0].userId
      : user.attributes.email,
    email: user.attributes.email,
    firstName: user.attributes.given_name,
    lastName: user.attributes.family_name,
    sub: user.attributes.sub,
    role: user.attributes["app-role"],
    lastLogin: generateDateForDB()
  };

  if (existingUser === false) {
    await createUser(userObject);
  } else {
    let updateItem = existingUser["Items"];
    updateItem.map(async userInfo => {
      userInfo.sub = user.attributes.sub;
      await updateUser(userInfo);
    });
  }
}
const checkRoleFromStore = async () => {
  let userRole;
  const currentUser = (await Auth.currentSession()).getIdToken();

  const {
    payload: { email }
  } = currentUser;

  const existingUser = await obtainUserByEmail({ email });

  if (existingUser === false) {
    return false;
  }
  const userdata = existingUser["Items"];

  userdata.map(async userInfo => {
    userRole = userInfo.role;
  });

  return userRole;
};

export const determineRole = async specRole => {
  const userStoreRole = await checkRoleFromStore();

  const roleArray = ["admin", "business", "state"];
  let role;

  if (userStoreRole && roleArray.includes(userStoreRole)) {
    role = userStoreRole;
  } else {
    if (
      specRole.includes("CHIP_D_USER_GROUP_ADMIN") ||
      specRole.includes("CHIP_V_USER_GROUP_ADMIN") ||
      specRole.includes("CHIP_P_USER_GROUP_ADMIN")
    ) {
      role = "admin";
    } else if (
      specRole.includes("CHIP_D_USER_GROUP") ||
      specRole.includes("CHIP_V_USER_GROUP") ||
      specRole.includes("CHIP_P_USER_GROUP")
    ) {
      role = "state";
    }
  }
  return role;
};

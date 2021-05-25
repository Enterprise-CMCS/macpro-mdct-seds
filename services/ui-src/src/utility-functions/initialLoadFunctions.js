import { createUser, obtainUserByEmail, updateUser } from "../libs/api";
import { API } from "aws-amplify";

export async function ascertainUserPresence(user) {
  const existingUser = await obtainUserByEmail({
    email: user.attributes.email
  });

  const userObject = {
    username: user.username,
    email: user.attributes.email,
    firstName: user.attributes.given_name,
    lastName: user.attributes.family_name,
    sub: user.attributes.sub,
    role: user.attributes["app-role"],
    lastLogin: new Date().toISOString()
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
const roleFromCognito = async () => {
  const { data } = await API.post("mdct-seds", "/users/get/username", {});
  console.log("got user from tony's pull", data);
  return data.role;
};
export const determineRole = async specRole => {
  const tempRole = await roleFromCognito();
  console.log("got temp role", tempRole);
  const roleArray = ["admin", "business", "state"];
  let role;

  if (tempRole && roleArray.includes(tempRole)) {
    console.log("in switch with temprole");
    switch (tempRole) {
      case "state":
        role = "state";
        break;
      case "business":
        role = "business";
        break;
      case "admin":
        role = "admin";
        break;
      default:
        break;
    }
    console.log("new pull role", role);
  } else if (specRole) {
    console.log("look for job codes");
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
  console.log("ROLE VALUE HERE", role);
  return role;
};

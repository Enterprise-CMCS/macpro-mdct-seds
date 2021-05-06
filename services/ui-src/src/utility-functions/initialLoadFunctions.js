import { createUser, obtainUserByEmail, updateUser } from "../libs/api";

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

  console.log("\n\n*****figured out user object: ");
  console.log(userObject);

  if (existingUser === false) {
    await createUser(userObject);
  } else {
    let updateItem = existingUser["Items"];
    updateItem.map(async userInfo => {
      userInfo.sub = user.attributes.sub;
      console.log("\n\n##### updating with this:");
      console.log(userInfo);
      await updateUser(userInfo);
    });
  }
}

export const determineRole = specRole => {
  const roleArray = ["admin", "business", "state"];
  let role;

  console.log("determining role");

  if (roleArray.includes(specRole)) {
    role = specRole;
  }

  console.log(specRole);

  if (specRole) {
    if (specRole.includes("CHIP_D_USER_GROUP_ADMIN") || specRole.includes("CHIP_V_USER_GROUP_ADMIN") || specRole.includes("CHIP_P_USER_GROUP_ADMIN")) {
      role = "admin";
    } else if (specRole.includes("CHIP_D_USER_GROUP") || specRole.includes("CHIP_V_USER_GROUP") || specRole.includes("CHIP_P_USER_GROUP")) {
      role = "state";
    }
  }

  console.log("!!!!!!role determined: ");
  console.log(role);

  return role;
};

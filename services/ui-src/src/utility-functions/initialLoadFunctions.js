import { createUser, obtainUserByEmail, updateUser } from "../libs/api";

export async function ascertainUserPresence(user) {
  console.log("\n\n\n---->making sure user is cool:");
  console.log(user);

  const existingUser = await obtainUserByEmail({
    email: user.attributes.email
  });

  let isMemberOf = "";

  if (user.attributes.ismemberof !== undefined) {
    isMemberOf = user.attributes.ismemberof;
  }

  if (user.attributes["custom:ismemberof"] !== undefined && isMemberOf === "") {
    isMemberOf = user.attributes["custom:ismemberof"];
  }

  const userRole = await determineRole(isMemberOf);

  const userObject = {
    username: user.username,
    email: user.attributes.email,
    firstName: user.attributes.given_name,
    lastName: user.attributes.family_name,
    role: userRole,
    lastLogin: new Date().toISOString()
  };
  if (existingUser === false) {
    await createUser(userObject);
  } else {
    let updateItem = existingUser["Items"];
    updateItem.map(async userInfo => {
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

  if (specRole) {
    if (specRole.includes("CHIP_D_USER_GROUP_ADMIN")) {
      role = "admin";
    } else if (role.includes("CHIP_D_USER_GROUP")) {
      role = "state";
    }
  }

  console.log("!!!!!!role determined: ", role);

  return role;
};

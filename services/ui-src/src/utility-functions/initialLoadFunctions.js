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
    role: determineRole(user.attributes.ismemberof),
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
  return role;
};

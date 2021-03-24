import { createUser, getUserByUsername, updateUser } from "../libs/api";

export async function ascertainUserPresence(user) {
  const userExist = await getUserByUsername({
    username: user.username,
  });
  const userObject = {
    username: user.username,
    email: user.attributes.email,
    firstName: user.attributes.given_name,
    lastName: user.attributes.family_name,
    role: determineRole(user.attributes.ismemberof),
    lastLogin: new Date().toISOString(),
  } 
  if (userExist === false) {
      await createUser(userObject);
    } else {
      let updateItem = userExist["Items"];
      updateItem.map(async (e) => {
        await updateUser(e);
      })
    }      
};

export const determineRole = role => {
    const roleArray = ["admin", "business", "state"];
    if (roleArray.includes(role)) {
      return role;
    }
    if (role) {
      if (role.includes("CHIP_D_USER_GROUP_ADMIN")) {
        role = "admin"
      } else if (role.includes("CHIP_D_USER_GROUP")) {
        role =  "state";
      }
    }
    return role;
};


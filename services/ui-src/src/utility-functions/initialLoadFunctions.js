import { createUser, obtainUserByEmail } from "../libs/api";

export async function ensureUserExistsInApi(email) {
  let existingUser = await obtainUserByEmail({ email });

  if (existingUser === false) {
    await createUser();
    existingUser = await obtainUserByEmail({ email });
  }

  return existingUser.Items[0];
}

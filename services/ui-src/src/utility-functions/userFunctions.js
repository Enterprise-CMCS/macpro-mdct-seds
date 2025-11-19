import { fetchAuthSession } from "aws-amplify/auth";
import { obtainUserByEmail } from "../libs/api";
import { onError } from "../libs/errorLib";

export const getUserInfo = async () => {
  let currentUserInfo;

  try {
    // Get user information
    const authUser = await fetchAuthSession();
    currentUserInfo = await obtainUserByEmail({
      email: authUser.tokens.idToken.payload.email
    });
  } catch (e) {
    onError(e);
  }

  return currentUserInfo;
};

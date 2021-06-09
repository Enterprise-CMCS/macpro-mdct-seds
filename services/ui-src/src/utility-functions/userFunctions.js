import { Auth } from "aws-amplify";
import { obtainUserByEmail } from "../libs/api";
import { onError } from "../libs/errorLib";

export const getUserInfo = async () => {
  let currentUserInfo;

  try {
    // Get user information
    const AuthUserInfo = (await Auth.currentSession()).getIdToken();
    currentUserInfo = await obtainUserByEmail({
      email: AuthUserInfo.payload.email
    });
  } catch (e) {
    onError(e);
  }

  return currentUserInfo;
};

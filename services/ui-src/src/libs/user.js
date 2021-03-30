import { Auth } from "aws-amplify";

export const currentUserInfo = async () => {
  return (await Auth.currentSession()).getIdToken().payload;
};

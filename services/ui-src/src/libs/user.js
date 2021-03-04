import { Auth } from "aws-amplify";
// import config from "../config";

const userKey = "userKey";

export async function currentUserInfo() {
  // Temporary change for local login
  // if (config.LOCAL_LOGIN === "true") {
  if (true) {
    return getLocalUserInfo();
  } else {
    // return Auth.currentUserInfo();
    return Auth.currentAuthenticatedUser();
  }
}

export function getLocalUserInfo() {
  return JSON.parse(window.localStorage.getItem(userKey));
}

export async function loginLocalUser(userInfo) {
  window.localStorage.setItem(userKey, JSON.stringify(userInfo));
}

import { Auth } from "aws-amplify";
import config from "../config";

const userKey = "userKey";

export async function currentUserInfo() {
  if (config.LOCAL_LOGIN === "true") {
    return getLocalUserInfo();
  } else {
    return Auth.currentUserInfo();
  }
}

export function getLocalUserInfo() {
  const info = JSON.parse(window.localStorage.getItem(userKey));

  return info;
}

export async function loginLocalUser(userInfo) {
  window.localStorage.setItem(userKey, JSON.stringify(userInfo));
}

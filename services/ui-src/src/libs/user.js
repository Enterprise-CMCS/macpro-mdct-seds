import { Auth } from "aws-amplify";
import config from "../config";

const userKey = "userKey";

export async function currentUserInfo() {
  if (config.LOCAL_LOGIN === "true") {
    return getLocalUserInfo();
  } else {
    console.log("inside users.js... loggin Auth.currentSession();");
    console.log(Auth.currentSession());
    return (await Auth.currentSession()).getIdToken().payload;
  }
}

export function getLocalUserInfo() {
  return JSON.parse(window.localStorage.getItem(userKey));
}

export async function loginLocalUser(userInfo) {
  window.localStorage.setItem(userKey, JSON.stringify(userInfo));
}

import { API } from "aws-amplify";
import config from "../config";
import { getLocalUserInfo } from "./user";

function requestOptions() {
  const localLogin = config.LOCAL_LOGIN === "true";

  if (localLogin) {
    // serverless offline passes the value of the cognito-identity-id into our lambdas as
    // requestContext.identity.cognitoIdentityId. This lets us set a user locally without involving Cognito.
    const currentUser = getLocalUserInfo();
    const options = {
      headers: { "cognito-identity-id": currentUser.username },
    };
    return options;
  } else {
    return {};
  }
}

export function listAmendments() {
  const opts = requestOptions();
  return API.get("amendments", "/amendments", opts);
}

export function getAmendment(id) {
  const opts = requestOptions();
  return API.get("amendments", `/amendments/${id}`, opts);
}

export function createAmendment(body) {
  const opts = requestOptions();
  opts.body = body;
  return API.post("amendments", "/amendments", opts);
}

export function updateAmendment(id, body) {
  const opts = requestOptions();
  opts.body = body;
  return API.put("amendments", `/amendments/${id}`, opts);
}

export function deleteAmendment(id) {
  const opts = requestOptions();
  return API.del("amendments", `/amendments/${id}`, opts);
}

export function listUsers() {
  const opts = requestOptions();
  console.log("opts from listUsers() in api.js");
  console.log(opts);

  return API.get("amendments", `/users`, opts);
}

export function activateDeactivateUser(data) {
  const opts = requestOptions();
  opts.body = data;
  return API.post("amendments", `/users/activation/${data.username}`, opts);
}

export function getUser(data) {
  console.log("zzzInside getUser of api.js");
  const opts = requestOptions();
  opts.body = data;
  console.log("zzzOpts from getUser of api.js", opts);
  return API.get("amendments", `/users/${data.userId}`, opts);
}

export function getUserByUsername(data) {
  console.log("zzzGetUesrByUserName");
  const opts = requestOptions();
  opts.body = data;
  console.log("zzzGetUesrByUserName opts", opts);
  return API.post("amendments", `/users/get`, opts);
}

export function updateUser(data) {
  const opts = requestOptions();
  opts.body = data;
  return API.post("amendments", `/users/update/${data.userId}`, opts);
}

export function createUser(data) {
  const opts = requestOptions();
  opts.body = data;
  return API.post("amendments", `/users/add`, opts);
}

export function getStateForms(stateId, specifiedYear, quarter) {
  const opts = requestOptions();
  return API.get(
    "amendments",
    `/forms/${stateId}/${specifiedYear}/${quarter}`,
    opts
  );
}

export function getSingleForm(state, specifiedYear, quarter, form) {
  const opts = requestOptions();
  return API.get(
    "amendments",
    `/single-form/${state}/${specifiedYear}/${quarter}/${form}`,
    opts
  );
}

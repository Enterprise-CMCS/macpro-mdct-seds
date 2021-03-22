import { API } from "aws-amplify";

const requestOptions = () => {
  return {};
};

export const exportToExcel = async () => {
  const opts = requestOptions();

  return API.post("mdct-seds", "/users/export-to-excel", opts);
};

export function listUsers() {
  const opts = requestOptions();
  return API.get("mdct-seds", `/users`, opts);
}

export function activateDeactivateUser(data) {
  const opts = requestOptions();
  opts.body = data;
  return API.post("mdct-seds", `/users/activation/${data.username}`, opts);
}

export function getUserById(data) {
  const opts = requestOptions();
  return API.get("mdct-seds", `/users/${data.userId}`, opts);
}

export function getUserByUsername(data) {
  const opts = requestOptions();
  opts.body = data;
  return API.post("mdct-seds", `/users/get`, opts);
}

export function updateUser(data) {
  const opts = requestOptions();
  opts.body = data;
  return API.post("mdct-seds", `/users/update/${data.userId}`, opts);
}

export function createUser(data) {
  const opts = requestOptions();
  opts.body = data;
  return API.post("mdct-seds", `/users/add`, opts);
}

export function getStateForms(stateId, specifiedYear, quarter) {
  const opts = requestOptions();
  return API.get(
    "mdct-seds",
    `/forms/${stateId}/${specifiedYear}/${quarter}`,
    opts
  );
}

export function getSingleForm(state, specifiedYear, quarter, form) {
  const opts = requestOptions();
  return API.get(
    "mdct-seds",
    `/single-form/${state}/${specifiedYear}/${quarter}/${form}`,
    opts
  );
}

export function getFormTypes() {
  const opts = requestOptions();
  return API.get("mdct-seds", "/form-types", opts);
}

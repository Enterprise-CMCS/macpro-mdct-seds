import { API } from "aws-amplify";

/*************************** HELPER FUNCTIONS ***************************/
const requestOptions = () => {
  return {};
};

/*************************** USER API ***************************/
// *** export to excel
export const exportToExcel = async () => {
  const opts = requestOptions();

  return API.post("mdct-seds", "/users/export-to-excel", opts);
};

// *** list all users
export const listUsers = () => {
  const opts = requestOptions();

  return API.get("mdct-seds", `/users`, opts);
};

// *** activate / deactivate user
export const activateDeactivateUser = data => {
  const opts = requestOptions();
  opts.body = data;

  return API.post("mdct-seds", `/users/activation/${data.username}`, opts);
};

// *** get user information by user id
export const getUserById = data => {
  const opts = requestOptions();

  return API.get("mdct-seds", `/users/${data.userId}`, opts);
};

// *** get user information by username
export const getUserByUsername = data => {
  const opts = requestOptions();
  opts.body = data;

  return API.post("mdct-seds", `/users/get`, opts);
};

// *** update user information
export const updateUser = data => {
  const opts = requestOptions();
  opts.body = data;

  return API.post("mdct-seds", `/users/update/${data.email}`, opts);
};

// *** create user
export const createUser = data => {
  const opts = requestOptions();
  opts.body = data;

  return API.post("mdct-seds", `/users/add`, opts);
};

/*************************** FORMS API ***************************/
// *** get forms associated with a specified state for specified year and quarter
export const getStateForms = (stateId, specifiedYear, quarter) => {
  const opts = requestOptions();

  return API.get(
    "mdct-seds",
    `/forms/${stateId}/${specifiedYear}/${quarter}`,
    opts
  );
};

// *** get single form associated with a specified state, year and quarter
export const getSingleForm = (state, specifiedYear, quarter, form) => {
  const opts = requestOptions();

  return API.get(
    "mdct-seds",
    `/single-form/${state}/${specifiedYear}/${quarter}/${form}`,
    opts
  );
};

// *** get form types
export const getFormTypes = _ => {
  const opts = requestOptions();

  return API.get("mdct-seds", "/form-types", opts);
};

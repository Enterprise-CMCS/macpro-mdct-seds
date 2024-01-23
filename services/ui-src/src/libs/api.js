import { API, Auth } from "aws-amplify";

/*************************** HELPER FUNCTIONS ***************************/
const requestOptions = async () => {
  const session = await Auth.currentSession();
  const token = await session.getIdToken().getJwtToken();
  const options = {
    headers: { "x-api-key": token }
  };
  return options;
};

/*************************** EXPORT API ***************************/
// *** export to excel
export const exportToExcel = async data => {
  const opts = await requestOptions();
  opts.body = data;

  return API.post("mdct-seds", "/export/export-to-excel", opts);
};

/*************************** LOAD DATA API ***************************/
// *** load data
export const loadData = async data => {
  const opts = await requestOptions();
  opts.body = data;

  return API.post("mdct-seds", "/load-data/upload", opts);
};

export const getTableNames = async () => {
  const opts = await requestOptions();

  return API.get("mdct-seds", "/load-data/get-table-names", opts);
};

/*************************** USER API ***************************/
// *** list all Users
export const listUsers = async () => {
  const opts = await requestOptions();

  return API.get("mdct-seds", `/users`, opts);
};

// *** activate / deactivate user
export const activateDeactivateUser = async data => {
  const opts = await requestOptions();
  opts.body = data;

  return API.post("mdct-seds", `/users/activation/${data.username}`, opts);
};

// *** get user information by user id
export const getUserById = async data => {
  const opts = await requestOptions();

  return API.get("mdct-seds", `/users/${data.userId}`, opts);
};

// *** get user information by username
export const obtainUserByEmail = async data => {
  const opts = await requestOptions();
  opts.body = data;

  return API.get("mdct-seds", `/users/get/email`, opts);
};

// *** update user information
export const updateUser = async data => {
  const opts = await requestOptions();
  opts.body = data;

  return API.post("mdct-seds", `/users/update/${data.userId}`, opts);
};

// *** create user
export const createUser = async data => {
  const opts = await requestOptions();
  opts.body = data;

  return API.post("mdct-seds", `/users/add`, opts);
};

/*************************** FORMS API ***************************/
// *** get forms associated with a specified state for specified year and quarter
export const getStateForms = async data => {
  const opts = await requestOptions();
  opts.body = data;

  return API.post("mdct-seds", `/forms/obtain-state-forms`, opts);
};

// *** update forms associated with a specified state for specified year and quarter
export const updateStateForm = async data => {
  const opts = await requestOptions();
  opts.body = data;

  return API.post("mdct-seds", `/state-forms/update`, opts);
};

// *** get single form associated with a specified state, year and quarter
export const getSingleForm = async (state, specifiedYear, quarter, form) => {
  const opts = await requestOptions();

  return API.get(
    "mdct-seds",
    `/single-form/${state}/${specifiedYear}/${quarter}/${form}`,
    opts
  );
};

// *** get form types
export const getFormTypes = async _ => {
  const opts = await requestOptions();

  return API.get("mdct-seds", "/form-types", opts);
};

// *** get form years and quarters
export const obtainAvailableForms = async data => {
  const opts = await requestOptions();
  opts.body = data;

  return API.post("mdct-seds", `/forms/obtainAvailableForms`, opts);
};

// *** save single form
export const saveSingleForm = async data => {
  const opts = await requestOptions();
  opts.body = data;

  return API.post("mdct-seds", "/single-form/save", opts);
};

// *** generate quarterly forms
export const generateQuarterlyForms = async data => {
  const opts = await requestOptions();
  opts.body = data;

  return API.post("mdct-seds", "/generate-forms", opts);
};

// *** get form template years
export const obtainFormTemplateYears = async data => {
  const opts = await requestOptions();
  opts.body = data;

  return API.post("mdct-seds", "/form-templates/years", opts);
};

// *** get a form template by year
export const obtainFormTemplate = async data => {
  const opts = await requestOptions();
  opts.body = data;

  return API.post("mdct-seds", "/form-template", opts);
};

// *** Create or update a form template based on year
export const updateCreateFormTemplate = async data => {
  const opts = await requestOptions();
  opts.body = data;

  return API.post("mdct-seds", "/form-templates/add", opts);
};

// *** generate enrollment totals
export const generateEnrollmentTotals = async data => {
  const opts = await requestOptions();
  opts.body = data;

  return API.post("mdct-seds", "/generate-enrollment-totals", opts);
};

// **
export const sendUncertifyEmail = async data => {
  const opts = await requestOptions();
  opts.body = data;
  return API.post("mdct-seds", `/notification/uncertified`, opts);
};

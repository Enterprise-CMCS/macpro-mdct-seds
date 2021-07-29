import { API } from "aws-amplify";

/*************************** HELPER FUNCTIONS ***************************/
const requestOptions = () => {
  return {};
};

/*************************** EXPORT API ***************************/
// *** export to excel
export const exportToExcel = async data => {
  const opts = requestOptions();
  opts.body = data;

  console.log(opts.body);

  return API.post("mdct-seds", "/export/export-to-excel", opts);
};

/*************************** LOAD DATA API ***************************/
// *** load data
export const loadData = async data => {
  const opts = requestOptions();
  opts.body = data;

  console.log(opts.body);

  return API.post("mdct-seds", "/load-data/upload", opts);
};

export const getTableNames = () => {
  const opts = requestOptions();

  return API.get("mdct-seds", "/load-data/get-table-names", opts);
};

/*************************** USER API ***************************/
// *** list all Users
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
export const obtainUserByUsername = data => {
  const opts = requestOptions();
  opts.body = data;

  return API.post("mdct-seds", `/users/get`, opts);
};

// *** get user information by username
export const obtainUserByEmail = data => {
  const opts = requestOptions();
  opts.body = data;

  return API.post("mdct-seds", `/users/get/email`, opts);
};

// *** update user information
export const updateUser = data => {
  const opts = requestOptions();
  opts.body = data;

  return API.post("mdct-seds", `/users/update/${data.userId}`, opts);
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

// *** get state forms based on form(s) provided
export const obtainStateForms = data => {
  const opts = requestOptions();
  opts.body = data;

  return API.post("mdct-seds", `/state-forms/obtain`, opts);
};

// *** get state forms based on form(s) provided
export const obtainAnswerEntriesFromForms = data => {
  const opts = requestOptions();
  opts.body = data;

  return API.post("mdct-seds", `/form-answers/obtain`, opts);
};

// *** update forms associated with a specified state for specified year and quarter
export const updateStateForm = data => {
  const opts = requestOptions();
  opts.body = data;

  return API.post("mdct-seds", `/state-forms/update`, opts);
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

// *** get age ramges
export const getAgeRanges = _ => {
  const opts = requestOptions();

  return API.get("mdct-seds", "/age-ranges", opts);
};

// *** get U.S. states listing
export const getStates = _ => {
  const opts = requestOptions();

  return API.get("mdct-seds", "/states", opts);
};

// *** get form status types
export const getStatuses = _ => {
  const opts = requestOptions();

  return API.get("mdct-seds", "/statuses", opts);
};

// *** get form types
export const getFormTypes = _ => {
  const opts = requestOptions();

  return API.get("mdct-seds", "/form-types", opts);
};

// *** get form years and quarters
export const obtainAvailableForms = data => {
  const opts = requestOptions();
  opts.body = data;

  return API.post("mdct-seds", `/forms/obtainAvailableForms`, opts);
};

// *** save single form
export const saveSingleForm = data => {
  const opts = requestOptions();
  opts.body = data;

  return API.post("mdct-seds", "/single-form/save", opts);
};

// *** generate quarterly forms
export const generateQuarterlyForms = data => {
  const opts = requestOptions();
  opts.body = data;

  return API.post("mdct-seds", "/generate-forms", opts);
};

// *** get form template years
export const obtainFormTemplateYears = data => {
  const opts = requestOptions();
  opts.body = data;

  return API.post("mdct-seds", "/form-templates/years", opts);
};

// *** get a form template by year
export const obtainFormTemplate = data => {
  const opts = requestOptions();
  opts.body = data;

  return API.post("mdct-seds", "/form-template", opts);
};

// *** Create or update a form template based on year
export const updateCreateFormTemplate = data => {
  const opts = requestOptions();
  opts.body = data;

  return API.post("mdct-seds", "/form-templates/add", opts);
};

// *** generate enrollment totals
export const generateEnrollmentTotals = data => {
  const opts = requestOptions();
  opts.body = data;

  return API.post("mdct-seds", "/generate-enrollment-totals", opts);
};

// **
export const sendUncertifyEmail = data => {
  const opts = requestOptions();
  opts.body = data;
  return API.post("mdct-seds", `/notification/uncertified`, opts);
};

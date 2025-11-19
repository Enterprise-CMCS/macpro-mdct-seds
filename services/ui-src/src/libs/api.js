import { get, put, post, del } from "aws-amplify/api";
import { fetchAuthSession } from "aws-amplify/auth";

/*************************** HELPER FUNCTIONS ***************************/
const requestOptions = async () => {
  const { idToken } = (await fetchAuthSession()).tokens ?? {};
  const options = {
    headers: { "x-api-key": idToken?.toString() }
  };
  return options;
};
const apiName = "mdct-seds";

const apiRequest = async (request, path, options) => {
  try {
    const response = await request({ apiName, path, options }).response;
    if (!("body" in response)) {
      return undefined;
    }

    const body = response.body;
    // body.json() dies on an empty response, spectacularly
    const text = await body.text();
    if (text && text.length > 0) {
      return JSON.parse(text);
    }

    return undefined;
  } catch (e) {
    // Return our own error for handling in the app
    const info = `Request Failed - ${path} - ${e.response?.body}`;
    console.log(e);
    console.log(info);
    throw new Error(info);
  }
};

export const apiLib = {
  get: async (path, options) => apiRequest(get, path, options),
  post: async (path, options) => apiRequest(post, path, options)
};

/*************************** USER API ***************************/
// *** list all Users
export const listUsers = async () => {
  const opts = await requestOptions();

  return await apiLib.get(`/users`, opts);
};

// *** get user information by user id
export const getUserById = async data => {
  const opts = await requestOptions();

  return await apiLib.get(`/users/${data.userId}`, opts);
};

// *** get user information by username
export const obtainUserByEmail = async data => {
  const opts = await requestOptions();
  opts.body = data;

  return await apiLib.post(`/users/get/email`, opts);
};

// *** update user information
export const updateUser = async data => {
  const opts = await requestOptions();
  opts.body = data;

  return await apiLib.post(`/users/update/${data.userId}`, opts);
};

// *** create user
export const createUser = async data => {
  const opts = await requestOptions();
  opts.body = data;

  return await apiLib.post(`/users/add`, opts);
};

/*************************** FORMS API ***************************/
// *** get forms associated with a specified state for specified year and quarter
export const getStateForms = async data => {
  const opts = await requestOptions();
  opts.body = data;

  return await apiLib.post(`/forms/obtain-state-forms`, opts);
};

// *** update forms associated with a specified state for specified year and quarter
export const updateStateForm = async data => {
  const opts = await requestOptions();
  opts.body = data;

  return await apiLib.post(`/state-forms/update`, opts);
};

// *** get single form associated with a specified state, year and quarter
export const getSingleForm = async (state, specifiedYear, quarter, form) => {
  const opts = await requestOptions();

  return await apiLib.get(
    `/single-form/${state}/${specifiedYear}/${quarter}/${form}`,
    opts
  );
};

// *** get form types
export const getFormTypes = async _ => {
  const opts = await requestOptions();

  return await apiLib.get("/form-types", opts);
};

// *** get form years and quarters
export const obtainAvailableForms = async data => {
  const opts = await requestOptions();
  opts.body = data;

  return await apiLib.post(`/forms/obtainAvailableForms`, opts);
};

// *** save single form
export const saveSingleForm = async data => {
  const opts = await requestOptions();
  opts.body = data;

  return await apiLib.post("/single-form/save", opts);
};

// *** generate quarterly forms
export const generateQuarterlyForms = async data => {
  const opts = await requestOptions();
  opts.body = data;

  return await apiLib.post("/generate-forms", opts);
};

// *** get form template years
export const obtainFormTemplateYears = async data => {
  const opts = await requestOptions();
  opts.body = data;

  return await apiLib.post("/form-templates/years", opts);
};

// *** get a form template by year
export const obtainFormTemplate = async data => {
  const opts = await requestOptions();
  opts.body = data;

  return await apiLib.post("/form-template", opts);
};

// *** Create or update a form template based on year
export const updateCreateFormTemplate = async data => {
  const opts = await requestOptions();
  opts.body = data;

  return await apiLib.post("/form-templates/add", opts);
};

// *** generate enrollment totals
export const generateEnrollmentTotals = async data => {
  const opts = await requestOptions();
  opts.body = data;

  return await apiLib.post("/generate-enrollment-totals", opts);
};

// **
export const sendUncertifyEmail = async data => {
  const opts = await requestOptions();
  opts.body = data;
  return await apiLib.post(`/notification/uncertified`, opts);
};

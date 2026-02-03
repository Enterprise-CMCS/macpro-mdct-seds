import { get, post } from "aws-amplify/api";
import { fetchAuthSession } from "aws-amplify/auth";

/*************************** HELPER FUNCTIONS ***************************/
const requestOptions = async () => {
  const { idToken } = (await fetchAuthSession()).tokens ?? {};
  const options = {
    headers: { "x-api-key": idToken?.toString() },
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
  post: async (path, options) => apiRequest(post, path, options),
};

/*************************** USER API ***************************/

/** @returns {Promise<AuthUser[]>} */
export const listUsers = async () => {
  const opts = await requestOptions();

  return await apiLib.get(`/users`, opts);
};

/**
 * @param {string} userId
 * @returns {Promise<AuthUser>}
 */
export const getUserById = async (userId) => {
  const opts = await requestOptions();

  return await apiLib.get(`/users/${userId}`, opts);
};

/**
 * Get or create the AuthUser record for the requesting user's Cognito token.
 *
 * Note that this _always_ returns a user object. No need to check.
 * The only exceptions are actual exceptions that will result in a 500 response.
 * @returns {Promise<AuthUser>}
 */
export const getCurrentUser = async () => {
  const opts = await requestOptions();
  return await apiLib.get(`/getCurrentUser`, opts);
};

/**
 * @param {AuthUser} user
 * @returns {Promise<void>}
 */
export const updateUser = async (user) => {
  const opts = await requestOptions();
  opts.body = user;

  return await apiLib.post(`/users/${user.userId}`, opts);
};

/*************************** FORMS API ***************************/

/**
 * @param {{ state: string, year: number, quarter: number }} data
 * @returns {Promise<StateForm[]>}
 */
export const listFormsForQuarter = async (data) => {
  const opts = await requestOptions();

  return await apiLib.get(
    `/forms/${data.state}/${data.year}/${data.quarter}`,
    opts
  );
};

/**
 * @param {{ state: string, year: number, quarter: number, form: FormAbbr, totalEnrollment: number }} data
 * @returns {Promise<void>}
 */
export const updateTotals = async (data) => {
  const { state, year, quarter, form } = data;
  const opts = await requestOptions();
  opts.body = data;

  return await apiLib.post(
    `/forms/${state}/${year}/${quarter}/${form}/totals`,
    opts
  );
};

/**
 * @param {string} stateId
 * @param {number} year
 * @param {number} quarter
 * @param {FormAbbr} form
 * @returns {Promise<{ statusData: StateForm, questions: FormQuestion[], answers: FormAnswer[] }>}
 */
export const getForm = async (state, year, quarter, form) => {
  const opts = await requestOptions();

  return await apiLib.get(`/forms/${state}/${year}/${quarter}/${form}`, opts);
};

/**
 * @param {string} stateId A two-letter U.S. state abbreviation
 * @returns {Promise<StateForm[]>}
 */
export const listFormsForState = async (stateId) => {
  const opts = await requestOptions();

  return await apiLib.get(`/forms/${stateId}`, opts);
};

/**
 * @param {{ statusData: StateForm, formAnswers: FormAnswer[] }} data
 * @returns {Promise<void>}
 */
export const updateForm = async (data) => {
  const { state_id, year, quarter, form } = data.statusData;
  const opts = await requestOptions();
  opts.body = data;

  return await apiLib.post(
    `/forms/${state_id}/${year}/${quarter}/${form}`,
    opts
  );
};

/**
 * @param {{ year: number, quarter: number }} data
 * @returns {Promise<void>}
 */
export const generateQuarterForms = async (data) => {
  const opts = await requestOptions();

  return await apiLib.post(
    `/admin/generate-forms?year=${data.year}&quarter=${data.quarter}`,
    opts
  );
};

/**
 * @returns {Promise<number[]>}
 */
export const listTemplateYears = async () => {
  const opts = await requestOptions();

  return await apiLib.get("/templates", opts);
};

/**
 * @param {number} year
 * @returns {Promise<FormTemplate>}
 */
export const getTemplate = async (year) => {
  const opts = await requestOptions();

  return await apiLib.get(`/templates/${year}`, opts);
};

/**
 * @param {FormTemplate}
 * @returns {Promise<void>}
 */
export const updateTemplate = async (data) => {
  const opts = await requestOptions();
  opts.body = data;

  return await apiLib.post(`/templates/${data.year}`, opts);
};

/** @returns {Promise<void>} */
export const generateEnrollmentTotals = async () => {
  const opts = await requestOptions();

  return await apiLib.post("/admin/generate-totals", opts);
};

/*
    NOTE: The SEDS business owners have requested that the email flow to users be disabled, but would like to be
    able to re-enable it at a future point (see: https://bit.ly/3w3mVmT). For now, this will be commented out and not removed.
  
  export const sendUncertifyEmail = async data => {
    const opts = await requestOptions();
    opts.body = data;
    return await apiLib.post(`/notification/uncertified`, opts);
  };
  */

/*
 * These JSDoc type definitions should be replaced by Typescript definitions,
 * as soon as we upgrade the UI from JS to Typescript.
 */

/**
 * @typedef {Object} AuthUser
 * @property {string} userId
 * @property {string} userNameSub
 * @property {string} username
 * @property {string} email
 * @property {string} firstName
 * @property {string} lastName
 * @property {"state" | "business" | "admin"} role
 * @property {string | undefined} state
 * @property {string} dateJoined
 * @property {string} lastLogin
 */

/**
 * @typedef {Object} FormTemplate
 * @property {number} year
 * @property {FormQuestion[]} template
 */

/**
 * @typedef FormQuestion
 * @property {string} question The format is `year-form-questionNumber`
 * @property {{ key: string, label: string }[] | undefined} age_ranges
 * @property {FormRow[]} rows
 */

/**
 * @typedef FormAnswer
 * @property {string} answer_entry The format is `state-year-quarter-form-ageRangeId-questionNumber`
 * @property {string} state_form See StateForm.state_form
 * @property {string} question See FormQuestion.question
 * @property {FormRow[]} rows
 */

/**
 * @typedef FormRow
 * @property {FormEntry} col1
 * @property {FormEntry} col2
 * @property {FormEntry} col3
 * @property {FormEntry} col4
 * @property {FormEntry} col5
 * @property {FormEntry} col6
 */

/** @typedef {string | number | null | Formula | FormulaResult} FormEntry */

/**
 * @typedef Formula
 * @property {string[]} targets
 * @property {string} actions
 * @property {string} formula Always `"<0> / <1>"`
 */

/**
 * @typedef FormulaResult
 * @property {string[]} targets
 * @property {string} answer A numeric string. May be "NaN" or "Infinity".
 */

/**
 * @typedef StateForm Sometimes synecdochically referred to as "statusData".
 * @property {string} state_form Format is `state-year-quarter-form`.
 * @property {string} state_id Two-letter state abbreviation.
 * @property {number} year
 * @property {number} quarter
 * @property {FormAbbr} form
 * @property {1|2|3|4} status_id
 * @property {[{ type: "text_multiline", entry: string | null }]} state_comments
 * @property {string} status_date
 * @property {string} status_modified_by
 * @property {string} last_modified
 * @property {string} last_modified_by
 */

/**
 * @typedef {"21E" | "64.EC" | "64.21E" | "64.ECI" | "GRE" | "21PW"} FormAbbr
 */

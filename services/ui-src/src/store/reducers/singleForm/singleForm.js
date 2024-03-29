// PACKAGES
import { Auth } from "aws-amplify";
import { obtainUserByEmail, updateStateForm } from "../../../libs/api";
import { generateDateForDB } from "../../../utility-functions/transformFunctions";

// HELPER FUNCTIONS
import {
  sortQuestionsByNumber,
  extractAgeRanges,
  formatAnswerData,
  insertAnswer,
  clearSingleQuestion,
  insertFPL
} from "./helperFunctions";

// ENDPOINTS
import { getSingleForm, saveSingleForm } from "../../../libs/api.js";
import {
  CERTIFY_AND_SUBMIT_FINAL,
  CERTIFY_AND_SUBMIT_PROVISIONAL,
  UNCERTIFY
} from "../../actions/certify";

import { SUMMARY_NOTES_SUCCESS } from "../../actions/statusData";
import { recursiveGetStateForms } from "../../../utility-functions/dbFunctions";

// ACTION TYPES
export const LOAD_SINGLE_FORM = "LOAD_SINGLE_FORM";
export const LOAD_FORM_FAILURE = "LOAD_FORM_FAILURE";
export const UPDATE_FORM_STATUS = "UPDATE_FORM_STATUS";
export const UPDATE_APPLICABLE_STATUS = "UPDATE_APPLICABLE_STATUS";
export const UPDATE_ANSWER = "UPDATE_ANSWER";
export const WIPE_FORM = "WIPE_FORM";
export const SAVE_FORM = "SAVE_FORM";
export const SAVE_FORM_FAILURE = "SAVE_FORM_FAILURE";
export const UPDATE_FPL = "UPDATE_FPL";

// ACTION CREATORS

const gotFPL = answers => {
  return {
    type: UPDATE_FPL,
    answers
  };
};

export const clearedForm = cleanAnswers => {
  return {
    type: WIPE_FORM,
    cleanAnswers
  };
};

export const gotFormData = formObject => {
  return {
    type: LOAD_SINGLE_FORM,
    formObject
  };
};
export const loadFormFailure = () => {
  return {
    type: LOAD_FORM_FAILURE
  };
};
export const gotAnswer = (answerArray, questionID) => {
  return {
    type: UPDATE_ANSWER,
    answerArray: formatAnswerData(answerArray),
    questionID
  };
};
export const updatedApplicableStatus = (
  activeStatus,
  username,
  status,
  statusId
) => {
  return {
    type: UPDATE_APPLICABLE_STATUS,
    activeStatus,
    username,
    status,
    statusId,
    timeStamp: new Date().toISOString()
  };
};

export const updatedLastSaved = username => {
  return {
    type: SAVE_FORM,
    username
  };
};

// THUNKS

export const updatedApplicableThunk = (
  activeStatus,
  status,
  statusId
) => async dispatch => {
  const username = await getUsername();
  dispatch(updatedApplicableStatus(activeStatus, username, status, statusId));
};

export const updateFPL = newFPL => {
  return async (dispatch, getState) => {
    const state = getState();
    const answers = state.currentForm.answers;
    try {
      let deepCopy = JSON.parse(JSON.stringify(answers));
      const updatedAnswers = insertFPL(deepCopy, newFPL);
      dispatch(gotFPL(updatedAnswers));
    } catch (error) {
      console.log("Error:", error);
      console.dir(error);
    }
  };
};

export const clearFormData = (user = "cleared") => {
  return async (dispatch, getState) => {
    const username = await getUsername();
    const state = getState();
    const timeStamp = new Date().toISOString();
    const answers = state.currentForm.answers;
    try {
      const emptyForm = answers.map(singleQuestion => {
        let deepCopy = JSON.parse(JSON.stringify(singleQuestion));
        const clearedRows = clearSingleQuestion(deepCopy.rows);
        deepCopy.rows = clearedRows;
        deepCopy.last_modified = timeStamp;
        deepCopy.last_modified_by = username;
        return deepCopy;
      });
      dispatch(clearedForm(emptyForm));
    } catch (error) {
      console.log("Error:", error);
      console.dir(error);
    }
  };
};
export const getFormData = (state, year, quarter, formName) => {
  return async dispatch => {
    try {
      // Call single-form endpoint
      const { questions, answers } = await getSingleForm(
        state,
        year,
        quarter,
        formName
      );

      // Call state forms endpoint for form status data
      const stateFormsByQuarter = await recursiveGetStateForms({
        state,
        year,
        quarter,
        startKey: false
      });

      // Sort questions by question number
      const sortedQuestions = [...questions].sort(sortQuestionsByNumber);

      // Sort answers to get the available age ranges
      const presentAgeRanges = extractAgeRanges(answers);

      // Filter status data for single form
      const singleFormStatusData = stateFormsByQuarter.find(
        ({ form }) => form === formName
      );

      // Final payload for redux
      const allFormData = {
        answers: answers,
        questions: sortedQuestions,
        statusData: singleFormStatusData,
        tabs: [...presentAgeRanges]
      };
      // Dispatch action creator to set data in redux
      dispatch(gotFormData(allFormData));
    } catch (error) {
      dispatch(loadFormFailure());
      console.log("Error:", error);
      console.dir(error);
    }
  };
};

export const getUsername = async () => {
  const currentUser = (await Auth.currentSession()).getIdToken();
  console.log("currentUser", currentUser);
  const {
    payload: { email }
  } = currentUser;
  const existingUser = await obtainUserByEmail({ email });
  if (existingUser === false) return false;
  const data = existingUser.Items.map(userInfo => userInfo.username);
  return data[0];
};

export const saveForm = () => {
  return async (dispatch, getState) => {
    const state = getState();
    const answers = state.currentForm.answers;
    const statusData = state.currentForm.statusData;
    state.currentForm.statusData.last_modified = generateDateForDB();
    const username = await getUsername();

    // Get total number of enrollees from question 7, quarter 4
    let total = 0;
    if (
      (statusData.form === "21E" || statusData.form === "64.21E") &&
      statusData.quarter === 4
    ) {
      for (const i in answers) {
        if (
          answers[i].question === `${statusData.year}-${statusData.form}-07`
        ) {
          let temp;
          const rows = answers[i].rows;
          for (const j in rows) {
            // Add all numeric col#'s together
            temp = Object.keys(rows[j]).reduce(
              (sum, key) => sum + (parseFloat(rows[j][key]) || 0),
              0
            );

            // Add to running total
            total += !Number.isNaN(temp) ? parseInt(temp) : 0;
          }
        }
      }
    }

    try {
      // Update Database
      await saveSingleForm({
        username,
        formAnswers: answers,
        statusData: statusData
      });

      await updateStateForm({
        state: statusData.state_id,
        form: statusData.form,
        year: statusData.year,
        quarter: statusData.quarter,
        totalEnrollment: total
      });

      // Update Last Saved in redux state
      dispatch(updatedLastSaved(username));
    } catch (error) {
      // If updating the form data fails, state will remain unchanged
      dispatch({ type: SAVE_FORM_FAILURE });
    }
  };
};

// INITIAL STATE
const initialState = {
  questions: [],
  answers: [],
  statusData: {},
  tabs: [],
  loadError: false
};

// REDUCER
export default (state = initialState, action) => {
  switch (action.type) {
    case WIPE_FORM:
      return {
        ...state,
        answers: action.cleanAnswers
      };
    case UPDATE_ANSWER:
      return {
        ...state,
        answers: insertAnswer(
          state.answers,
          action.answerArray,
          action.questionID
        )
      };
    case LOAD_SINGLE_FORM:
      return {
        ...state,
        questions: action.formObject.questions,
        answers: action.formObject.answers,
        statusData: action.formObject.statusData,
        tabs: action.formObject.tabs,
        loadError: false
      };
    case LOAD_FORM_FAILURE:
      return {
        ...state,
        loadError: true
      };
    case UPDATE_APPLICABLE_STATUS:
      return {
        ...state,
        statusData: {
          ...state.statusData,
          not_applicable: action.activeStatus,
          last_modified_by: action.username,
          last_modified: action.timeStamp,
          status: action.status,
          status_id: action.statusId,
          status_date: action.timeStamp,
          status_modified_by: action.username
        }
      };
    case CERTIFY_AND_SUBMIT_FINAL: // needs updating since the shape of the initial state has changed
      return {
        ...state,
        statusData: {
          ...state.statusData,
          status: "Final Data Certified and Submitted",
          status_date: new Date().toISOString(), // Need to update this with coming soon helper function
          status_id: 4,
          status_modified_by: action.username,
          last_modified_by: action.username,
          last_modified: new Date().toISOString() // Need to update this with coming soon helper function
        }
      };
    case CERTIFY_AND_SUBMIT_PROVISIONAL:
      return {
        ...state,
        statusData: {
          ...state.statusData,
          status: "Provisional Data Certified and Submitted",
          status_date: new Date().toISOString(), // Need to update this with coming soon helper function
          status_id: 3,
          status_modified_by: action.username,
          last_modified_by: action.username,
          last_modified: new Date().toISOString() // Need to update this with coming soon helper function
        }
      };
    case SUMMARY_NOTES_SUCCESS:
      return {
        ...state,
        statusData: {
          ...state.statusData,
          state_comments: action.tempStateComments
        }
      };
    case UNCERTIFY:
      return {
        ...state,
        statusData: {
          ...state.statusData,
          status: "In Progress",
          status_id: 2,
          status_modified_by: action.username,
          last_modified_by: action.username,
          last_modified: new Date().toISOString(), // Need to update this with coming soon helper function
          status_date: new Date().toISOString() // Need to update this with coming soon helper function
        }
      };
    case SAVE_FORM:
      return {
        ...state,
        statusData: {
          ...state.statusData,
          last_modified: new Date().toISOString(),
          save_error: false,
          last_modified_by: action.username
        }
      };
    case SAVE_FORM_FAILURE:
      return {
        ...state,
        statusData: {
          ...state.statusData,
          save_error: true
        }
      };
    case UPDATE_FPL:
      return {
        ...state,
        answers: action.answers
      };
    default:
      return state;
  }
};

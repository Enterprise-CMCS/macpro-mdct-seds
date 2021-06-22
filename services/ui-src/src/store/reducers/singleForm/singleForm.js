// PACKAGES
import { API, Auth } from "aws-amplify";
import { obtainUserByEmail } from "../../../libs/api";

// HELPER FUNCTIONS
import {
  sortQuestionsByNumber,
  extractAgeRanges,
  formatAnswerData,
  insertAnswer,
  clearSingleQuestion,
  insertFPL
} from "./helperFunctions";

import { generateDateForDB } from "../../../utility-functions/transformFunctions";

// ENDPOINTS
import {
  getSingleForm,
  getStateForms,
  saveSingleForm
} from "../../../libs/api.js";
import {
  CERTIFY_AND_SUBMIT_FINAL,
  CERTIFY_AND_SUBMIT_PROVISIONAL,
  UNCERTIFY
} from "../../actions/certify";

import { SUMMARY_NOTES_SUCCESS } from "../../actions/statusData";

// ACTION TYPES
export const LOAD_SINGLE_FORM = "LOAD_SINGLE_FORM";
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
    timeStamp: generateDateForDB(new Date())
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
  await API.post("mdct-seds", "/users/get/username", {}).then(data => {
    const username = data.data.username;
    dispatch(updatedApplicableStatus(activeStatus, username, status, statusId));
  });
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
    const { data } = await API.post("mdct-seds", "/users/get/username", {});
    const username = data.username;
    const state = getState();
    const timeStamp = generateDateForDB();
    const answers = state.currentForm.answers;
    try {
      const emptyForm = await answers.map(singleQuestion => {
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
      const stateFormsByQuarter = await getStateForms(state, year, quarter);

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
      console.log("Error:", error);
      console.dir(error);
    }
  };
};

const getUsername = async () => {
  const currentUser = (await Auth.currentSession()).getIdToken();
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
    const username = await getUsername();

    try {
      // Update Database
      await saveSingleForm({
        username,
        formAnswers: answers,
        statusData: statusData
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
  tabs: []
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
        tabs: action.formObject.tabs
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
          status_date: generateDateForDB(new Date()),
          status_id: 4,
          status_modified_by: action.username,
          last_modified_by: action.username,
          last_modified: generateDateForDB(new Date())
        }
      };
    case CERTIFY_AND_SUBMIT_PROVISIONAL:
      return {
        ...state,
        statusData: {
          ...state.statusData,
          status: "Provisional Data Certified and Submitted",
          status_date: generateDateForDB(new Date()),
          status_id: 3,
          status_modified_by: action.username,
          last_modified_by: action.username,
          last_modified: generateDateForDB(new Date())
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
          last_modified: generateDateForDB(),
          status_date: generateDateForDB()
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

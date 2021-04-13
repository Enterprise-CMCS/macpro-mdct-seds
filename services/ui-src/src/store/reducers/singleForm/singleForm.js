// HELPER FUNCTIONS
import {
  sortQuestionsByNumber,
  extractAgeRanges,
  formatAnswerData,
  insertAnswer
} from "./helperFunctions";

// ENDPOINTS
import {
  getSingleForm,
  getStateForms,
  saveSingleForm
} from "../../../libs/api.js";
import {
  CERTIFY_AND_SUBMIT_FINAL,
  CERTIFY_AND_SUBMIT_PROVISIONAL
} from "../../actions/certify";

// ACTION TYPES
export const LOAD_SINGLE_FORM = "LOAD_SINGLE_FORM";
export const UPDATE_FORM_STATUS = "UPDATE_FORM_STATUS";
export const UNCERTIFY_FORM = "UNCERTIFY_FORM";
export const UPDATE_ANSWER = "UPDATE_ANSWER";
export const SAVE_FORM = "SAVE_FORM";
export const SAVE_FORM_FAILURE = "SAVE_FORM_FAILURE";

// ACTION CREATORS
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
export const updatedStatus = activeBoolean => {
  return {
    type: UPDATE_FORM_STATUS,
    activeStatus: activeBoolean
  };
};

export const updatedLastSaved = username => {
  return {
    type: SAVE_FORM,
    username
  };
};

// THUNKS
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

export const disableForm = activeBoolean => {
  return dispatch => {
    dispatch(updatedStatus(activeBoolean));
  };
};

export const saveForm = (username, formAnswers) => {
  return async dispatch => {
    try {
      // Update Database
      await saveSingleForm({
        username: username,
        formAnswers: formAnswers
      });

      // Update Last Saved in redux state
      dispatch(updatedLastSaved(username, formAnswers));
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
    case UPDATE_FORM_STATUS:
      return {
        ...state,
        not_applicable: action.activeStatus
      };
    case CERTIFY_AND_SUBMIT_FINAL: // needs updating since the shape of the initial state has changed
      return {
        ...state,
        status: "final",
        last_modified_by: action.username,
        last_modified: new Date().toString()
      };
    case CERTIFY_AND_SUBMIT_PROVISIONAL: // needs updating since the shape of the initial state has changed
      return {
        ...state,
        status: "provisional",
        last_modified_by: action.username,
        last_modified: new Date().toString()
      };
    case SAVE_FORM:
      return {
        ...state,
        statusData: {
          ...state.statusData,
          last_modified: new Date().toString(),
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
    default:
      return state;
  }
};

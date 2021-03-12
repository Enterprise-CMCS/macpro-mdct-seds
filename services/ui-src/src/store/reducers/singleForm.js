// ENDPOINTS
import { getSingleForm, getStateForms } from "../../../src/libs/api.js";
import { sortQuestionsByNumber } from "../helperFunctions";
import {
  CERTIFY_AND_SUBMIT_FINAL,
  CERTIFY_AND_SUBMIT_PROVISIONAL
} from "../actions/certify";

// ACTION TYPES
export const LOAD_SINGLE_FORM = "LOAD_SINGLE_FORM";
export const UPDATE_FORM_STATUS = "UPDATE_FORM_STATUS";
export const UNCERTIFY_FORM = "UNCERTIFY_FORM";
export const UPDATE_ANSWER = "UPDATE_ANSWER";

// ACTION CREATORS
export const gotFormData = formObject => {
  return {
    type: LOAD_SINGLE_FORM,
    formObject
  };
};
export const updatedStatus = activeBoolean => {
  return {
    type: UPDATE_FORM_STATUS,
    activeStatus: activeBoolean
  };
};

export const gotAnswer = something => {
  return {
    type: UPDATE_ANSWER,
    something
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
      let sortedQuestions = [...questions].sort(sortQuestionsByNumber);

      // Sort answers

      // Filter status data for single form
      const singleFormStatusData = stateFormsByQuarter.find(
        ({ form }) => form === formName
      );
      // Final payload for redux
      const allFormData = {
        answers: answers,
        questions: sortedQuestions,
        statusData: singleFormStatusData
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

export const setAnswer = something => {
  return dispatch => {
    dispatch(gotAnswer(something));
  };
};
// should there be some kind of loading indicator so people dont navigate away while save is occuring

// INITIAL STATE
const initialState = {
  questions: [],
  answers: [],
  statusData: {}
};

// REDUCER
export default (state = initialState, action) => {
  switch (action.type) {
    case UPDATE_ANSWER:
      return {
        ...state,
        answers: [...state.answers]
      };
    case LOAD_SINGLE_FORM:
      return {
        ...state,
        questions: action.formObject.questions,
        answers: action.formObject.answers,
        statusData: action.formObject.statusData
      };
    case UPDATE_FORM_STATUS:
      return {
        ...state,
        not_applicable: action.activeStatus
      };
    case CERTIFY_AND_SUBMIT_FINAL:
      return {
        ...state,
        status: "final",
        last_modified_by: action.username,
        last_modified: new Date().toString()
      };
    case CERTIFY_AND_SUBMIT_PROVISIONAL:
      return {
        ...state,
        status: "provisional",
        last_modified_by: action.username,
        last_modified: new Date().toString()
      };
    case UNCERTIFY_FORM:
      return {
        ...state,
        status: "in_progress"
      };
    default:
      return state;
  }
};

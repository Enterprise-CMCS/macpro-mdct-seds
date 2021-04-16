// HELPER FUNCTIONS
import {
  sortQuestionsByNumber,
  extractAgeRanges,
  formatAnswerData,
  insertAnswer,
  clearSingleQuestion
} from "./helperFunctions";

// ENDPOINTS
import { getSingleForm, getStateForms } from "../../../libs/api.js";
import {
  CERTIFY_AND_SUBMIT_FINAL,
  CERTIFY_AND_SUBMIT_PROVISIONAL
} from "../../actions/certify";

import { SUMMARY_NOTES_SUCCESS } from "../../actions/statusData";

// ACTION TYPES
export const LOAD_SINGLE_FORM = "LOAD_SINGLE_FORM";
export const UPDATE_APPLICABLE_STATUS = "UPDATE_APPLICABLE_STATUS";
export const UNCERTIFY_FORM = "UNCERTIFY_FORM";
export const UPDATE_ANSWER = "UPDATE_ANSWER";
export const WIPE_FORM = "WIPE_FORM";

// ACTION CREATORS
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
  user,
  status,
  statusId
) => {
  return {
    type: UPDATE_APPLICABLE_STATUS,
    activeStatus,
    user,
    status,
    statusId,
    timeStamp: new Date().toISOString()
  };
};

// THUNKS
export const clearFormData = () => {
  return async (dispatch, getState) => {
    const state = getState();
    const answers = state.currentForm.answers;
    try {
      const emptyForm = await answers.map(singleQuestion => {
        let deepCopy = JSON.parse(JSON.stringify(singleQuestion));
        const clearedRows = clearSingleQuestion(deepCopy.rows);
        deepCopy.rows = clearedRows;
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
          last_modified_by: action.user,
          last_modified: action.timeStamp,
          status: action.status,
          status_id: action.statusId,
          status_date: action.timeStamp,
          status_modified_by: action.user
        }
      };
    case CERTIFY_AND_SUBMIT_FINAL: // needs updating since the shape of the initial state has changed
      return {
        ...state,
        status: "final",
        last_modified_by: action.username,
        last_modified: new Date().toISOString() // Need to update this with coming soon helper function
      };
    case CERTIFY_AND_SUBMIT_PROVISIONAL:
      return {
        ...state,
        statusData: {
          ...state.statusData,
          status: "Provisional Data Certified and Submitted",
          status_id: 3,
          status_modified_by: action.userName,
          last_modified_by: action.userName,
          last_modified: new Date().toISOString().substring(0, 10) // Need to update this with coming soon helper function
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
    default:
      return state;
  }
};

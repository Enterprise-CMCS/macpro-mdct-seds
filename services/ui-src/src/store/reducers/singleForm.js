//
import {
  sortQuestionsByNumber,
  extractAgeRanges,
  formatAnswerData,
  insertAnswer
} from "../helperFunctions";

// ENDPOINTS
import { getSingleForm, getStateForms } from "../../../src/libs/api.js";
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

// end type, ID and data with type UPDATE ANSWER

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

export const gotAnswer = (answerArray, questionID) => {
  // const payload = answerArray ? answerArray : []
  return {
    type: UPDATE_ANSWER,
    answerArray,
    questionID
  };
};

export const setAnswer = inputArray => {
  return dispatch => {
    // helper function to format array of data into an array of objects
    const formattedAnswers = formatAnswerData(inputArray);

    console.log("columned answers !! \n\n\n\n\n", formattedAnswers);
    dispatch(gotAnswer(formattedAnswers));
  };
};
// use JSONPATH right in the reducer to update the answer array
// different jsonpath methods
// .query .stringify .paths .parse .apply**,

// will maybe only need ID and value??

// @ carts: formdata.js

// case QUESTION_ANSWERED: {
//   const fragment = selectQuestion({ formData: state }, action.fragmentId);
//   fragment.answer.entry = action.data;
//   return JSON.parse(JSON.stringify(state));
// }

// @ reducer
// return {
//   ...state,
// answers: [...state.answers, someFunc(state.answers)]
// }

// @ action
// send type, ID and data with type UPDATE ANSWER

// @ helper function
// state is the entire store/ the state tied to this reducer
// build a path to the correct answer place
// query the store using the path
// retun the question???

// export const selectQuestion = (state, id) => {
//   const jp = `$..[*].contents.section.subsections[*].parts[*]..questions[?(@.id=='${id}')]`;
//   const questions = jsonpath.query(state, jp);
//   if (questions.length) {
//     return questions[0];
//   }

//   return null;
// };

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
        // answers: [
        //   ...state.answers,
        //   insertAnswer(state.answers, action.answerArray, action.questionID)
        // ],
        answers: [...state.answers]
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
    default:
      return state;
  }
};

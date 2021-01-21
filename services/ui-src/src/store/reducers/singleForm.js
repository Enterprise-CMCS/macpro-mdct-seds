// Temporary import, using 21E as an example of a form
import * as data from "../toDelete/21E.json";

// ACTION TYPES
export const LOAD_SINGLE_FORM = "LOAD_SINGLE_FORM";

// ACTION CREATORS
export const gotFormData = (formArray = {}) => {
  return {
    type: LOAD_SINGLE_FORM,
    formArray
  };
};

// THUNKS
// Make call to aws-amplify // WEB SOCKETS?
export const getFormData = ({ formID }) => {
  return async dispatch => {
    // Call aws amplify endpoint. This is a placeholder
    // const { data } = results;

    dispatch(gotFormData(data));
  };
};

// INITIAL STATE
const initialState = {
  currentForm: [...data.default]
};

// REDUCER
export default (state = initialState, action) => {
  switch (action.type) {
    case LOAD_SINGLE_FORM:
      return {
        ...state,
        currentForm: action.formArray
      };
    default:
      return state;
  }
};

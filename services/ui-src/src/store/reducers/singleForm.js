// Temporary import, using 21E as an example of a form
import * as dummydata from "../toDelete/sample21query.json";
const data = dummydata.default[0];
// ACTION TYPES
export const LOAD_SINGLE_FORM = "LOAD_SINGLE_FORM";
export const UPDATE_FORM_STATUS = "UPDATE_FORM_STATUS";

// ACTION CREATORS
export const gotFormData = (formObject = {}) => {
  return {
    type: LOAD_SINGLE_FORM,
    formObject
  };
};
export const updatedStatus = activeBoolean => {
  return {
    type: UPDATE_FORM_STATUS,
    activeBoolean
  };
};

// THUNKS
// Make call to aws-amplify
export const getFormData = ({ formID }) => {
  return async dispatch => {
    // Call aws amplify endpoint. This is a placeholder
    // const { data } = results;
    // will also have to fetch status of form, this is currently not included

    dispatch(gotFormData(data));
  };
};
// export const disableForm = activeBoolean => {
//   return dispatch => {
//     dispatch(updatedStatus(true));
//   };
// };
export const disableForm = activeBoolean => async dispatch => {
  dispatch(updatedStatus(true));
};

// INITIAL STATE
const initialState = {
  ...data
};

// REDUCER
export default (state = initialState, action) => {
  switch (action.type) {
    case LOAD_SINGLE_FORM:
      return {
        ...state,
        ...action.formObject
      };
    case UPDATE_FORM_STATUS:
      return {
        ...state,
        not_applicable: action.activeBoolean
      };
    default:
      return state;
  }
};

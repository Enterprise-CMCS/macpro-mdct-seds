// Temporary import, using 21E as an example of a form
import * as data from "../toDelete/21E.json";

// ACTION TYPES
export const LOAD_SINGLE_FORM = "LOAD_SINGLE_FORM";
export const UPDATE_FORM_STATUS = "UPDATE_FORM_STATUS";

// ACTION CREATORS
export const gotFormData = (formArray = {}) => {
  return {
    type: LOAD_SINGLE_FORM,
    formArray
  };
};
export const updatedStatus = (updateObj = {}) => ({
  type: UPDATE_FORM_STATUS,
  activeStatus: updateObj
});

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
export const disableForm = (dispatch, activeStatus) => {
  return async dispatch => {
    // Call aws amplify endpoint to update the status of this form.
    // const { data } = results;
    dispatch(updatedStatus({ status: activeStatus }));
  };
};

// INITIAL STATE
const initialState = {
  currentForm: [...data.default],
  status: "active"
};

// REDUCER
export default (state = initialState, action) => {
  switch (action.type) {
    case LOAD_SINGLE_FORM:
      return {
        ...state,
        currentForm: action.formArray
      };
    case UPDATE_FORM_STATUS:
      return {
        ...state,
        status: action.activeStatus.status
      };
    default:
      return state;
  }
};

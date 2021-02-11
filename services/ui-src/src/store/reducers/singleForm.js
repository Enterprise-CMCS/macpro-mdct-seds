import {
  CERTIFY_AND_SUBMIT_FINAL,
  CERTIFY_AND_SUBMIT_PROVISIONAL
} from "../actions/certify";
import * as dummydata from "../toDelete/sample21Equery.json";
const data = dummydata.default[0];
// ACTION TYPES
export const LOAD_SINGLE_FORM = "LOAD_SINGLE_FORM";
export const UPDATE_FORM_STATUS = "UPDATE_FORM_STATUS";
export const UNCERTIFY_FORM = "UNCERTIFY_FORM";

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
    activeStatus: activeBoolean
  };
};

// THUNKS
// Make call to aws-amplify
export const getFormData = ({ formID }) => {
  return async dispatch => {
    // Call aws amplify endpoint. This is a placeholder
    // const { data } = results;

    dispatch(gotFormData(data));
  };
};

export const disableForm = activeBoolean => {
  return dispatch => {
    dispatch(updatedStatus(activeBoolean));
  };
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

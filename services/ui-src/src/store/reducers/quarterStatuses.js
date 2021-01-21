// Temporary import, using state_forms.json static data
// This is mimicking a query for All states, 1 form, 1 quarter
import * as data from "../toDelete/state_forms.json";

// ACTION TYPES
export const LOAD_FORMS = "LOAD_FORMS";
export const UPDATE_STATUS = "UPDATE_STATUS";
export const UPDATE_TIMESTAMP = "UPDATE_TIMESTAMP";

// ACTION CREATORS
export const gotQuarterStatuses = (statusArray = []) => {
  return {
    type: LOAD_FORMS,
    statusArray
  };
};

// THUNKS
// Make call to aws-amplify // WEB SOCKETS?
export const getQuarterStatuses = ({ userData }) => {
  return async dispatch => {
    // Call aws amplify endpoint. This is a placeholder
    // const data = quarterForms;
    // dispatch(gotQuarterStatuses(data));
  };
};

// INITIAL STATE
const initialState = {
  quarterForms: [...data.default]
};

// REDUCER
export default (state = initialState, action) => {
  switch (action.type) {
    case LOAD_FORMS:
      return {
        ...state,
        quarterForms: action.statusArray
      };

    default:
      return state;
  }
};

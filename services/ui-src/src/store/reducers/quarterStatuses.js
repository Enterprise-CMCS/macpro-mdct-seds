// ENDPOINTS
import { getStateForms } from "../../../src/libs/api.js";

// ACTION TYPES
export const LOAD_FORMS = "LOAD_FORMS";
export const UPDATE_STATUS = "UPDATE_STATUS";
export const UPDATE_TIMESTAMP = "UPDATE_TIMESTAMP";

// ACTION CREATORS
export const gotQuarterStatuses = statusArray => {
  return {
    type: LOAD_FORMS,
    statusArray
  };
};

// THUNKS
export const getQuarterStatuses = (state, year, quarter) => {
  return async dispatch => {
    try {
      const data = await getStateForms(state, year, quarter);
      dispatch(gotQuarterStatuses(data));
    } catch (error) {
      console.log("Error:", error);
      console.dir(error);
    }
  };
};

// INITIAL STATE
const initialState = {
  quarterForms: []
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

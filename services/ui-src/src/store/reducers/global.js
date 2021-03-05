// Temporary import, using forms.json static data
import * as forms from "../toDelete/forms.json";
import * as age_ranges from "../toDelete/age_ranges.json";
import * as states from "../toDelete/states.json";
import * as status from "../toDelete/status.json";

import { getFormTypes } from "../../../src/libs/api.js";

// ACTION TYPES
export const LOAD_FORM_TYPES = "LOAD_FORM_TYPES";
export const LOAD_AGE_RANGES = "LOAD_AGE_RANGES";
export const LOAD_STATES = "LOAD_STATES";
export const LOAD_STATUS_TYPES = "LOAD_STATUS_TYPES";

// ACTION CREATORS
export const gotFormTypes = (formArray = []) => {
  return {
    type: LOAD_FORM_TYPES,
    formArray
  };
};
export const gotAgeRanges = (agesArray = []) => {
  return {
    type: LOAD_AGE_RANGES,
    agesArray
  };
};
export const gotStates = (statesArray = []) => {
  return {
    type: LOAD_STATES,
    statesArray
  };
};
export const gotStatusTypes = (statusArray = []) => {
  return {
    type: LOAD_STATUS_TYPES,
    statusArray
  };
};

// THUNKS
export const fetchFormTypes = () => {
  return async dispatch => {
    try {
      const data = await getFormTypes();
      dispatch(gotFormTypes(data));
    } catch (error) {
      console.log("Error:", error);
      console.dir(error);
    }
  };
};

export const getAgeRanges = () => {
  return async dispatch => {
    // Call aws amplify endpoint. This is a placeholder
    // const data = fetchedData
    // dispatch(gotAgeRanges(data));
  };
};
export const getStates = () => {
  return async dispatch => {
    // Call aws amplify endpoint. This is a placeholder
    // const data = fetchedData
    // dispatch(gotStates(data));
  };
};
export const getStatusTypes = () => {
  return async dispatch => {
    // Call aws amplify endpoint. This is a placeholder
    // const data = fetchedData
    // dispatch(gotStatusTypes(data));
  };
};

// INITIAL STATE
const initialState = {
  formTypes: [],
  age_ranges: [...age_ranges.default],
  states: [...states.default],
  status: [...status.default]
};

// REDUCER
export default (state = initialState, action) => {
  switch (action.type) {
    case LOAD_FORM_TYPES:
      return {
        ...state,
        formTypes: action.formArray
      };
    case LOAD_AGE_RANGES:
      return {
        ...state,
        age_ranges: action.agesArray
      };
    case LOAD_STATES:
      return {
        ...state,
        states: action.statesArray
      };
    case LOAD_STATUS_TYPES:
      return {
        ...state,
        status: action.statusArray
      };

    default:
      return state;
  }
};

// Temporary import, using forms.json static data
import * as age_ranges from "../to-delete/age_ranges.json";
import * as states from "../to-delete/states.json";

// ACTION TYPES
export const LOAD_FORM_TYPES = "LOAD_FORM_TYPES";
export const LOAD_AGE_RANGES = "LOAD_AGE_RANGES";
export const LOAD_STATES = "LOAD_STATES";

// ACTION CREATORS
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

// INITIAL STATE
const initialState = {
  age_ranges: [...age_ranges.default],
  states: [...states.default]
};

// REDUCER
export default (state = initialState, action) => {
  switch (action.type) {
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
    default:
      return state;
  }
};

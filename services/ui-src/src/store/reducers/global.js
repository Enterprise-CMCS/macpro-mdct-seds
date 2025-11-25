// Temporary import, using forms.json static data
import * as age_ranges from "../to-delete/age_ranges.json";

// ACTION TYPES
export const LOAD_AGE_RANGES = "LOAD_AGE_RANGES";

// ACTION CREATORS
export const gotAgeRanges = (agesArray = []) => {
  return {
    type: LOAD_AGE_RANGES,
    agesArray
  };
};

export const getAgeRanges = () => {
  return async dispatch => {
    // Call aws amplify endpoint. This is a placeholder
    // const data = fetchedData
    // dispatch(gotAgeRanges(data));
  };
};

// INITIAL STATE
const initialState = {
  age_ranges: [...age_ranges.default]
};

// REDUCER
export default (state = initialState, action) => {
  switch (action.type) {
    case LOAD_AGE_RANGES:
      return {
        ...state,
        age_ranges: action.agesArray
      };
    default:
      return state;
  }
};

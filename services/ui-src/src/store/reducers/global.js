import { getAgeRanges, getStates, getStatuses } from "../../../src/libs/api.js";

// ACTION TYPES
export const LOAD_AGE_RANGES = "LOAD_AGE_RANGES";
export const LOAD_STATES = "LOAD_STATES";
export const LOAD_STATUSES = "LOAD_STATUSES";

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

export const gotStatuses = (statusesArray = []) => {
  return {
    type: LOAD_STATUSES,
    statusesArray
  };
};

// THUNKS
export const fetchAgeRanges = () => {
  return async dispatch => {
    try {
      const data = await getAgeRanges();
      dispatch(gotAgeRanges(data));
    } catch (error) {
      console.log("Error:", error);
      console.dir(error);
    }
  };
};

export const fetchStates = () => {
  return async dispatch => {
    try {
      const data = await getStates();
      dispatch(gotStates(data));
    } catch (error) {
      console.log("Error:", error);
      console.dir(error);
    }
  };
};

export const fetchStatuses = () => {
  return async dispatch => {
    try {
      const data = await getStatuses();
      dispatch(gotStatuses(data));
    } catch (error) {
      console.log("Error:", error);
      console.dir(error);
    }
  };
};

// INITIAL STATE
const initialState = {
  age_ranges: [],
  states: [],
  statuses: []
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
    case LOAD_STATUSES:
      return {
        ...state,
        statuses: action.statusesArray
      };
    default:
      return state;
  }
};

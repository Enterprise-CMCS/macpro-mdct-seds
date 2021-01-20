import quarterForms from "./toDelete/initialFormData";

// ACTION TYPES
export const LOAD_FORMS = "LOAD_FORMS";
export const UPDATE_STATUS = "UPDATE_STATUS";
export const UPDATE_TIMESTAMP = "UPDATE_TIMESTAMP";

// ACTION CREATORS
export const getFormStatusData = (formArray = []) => {
  return {
    type: LOAD_FORMS,
    formArray
  };
};
export const updateStatus = (statusObj, form_id) => {
  // find the object to be updated
  // update status
  // return array with mutated/new object

  return {
    type: UPDATE_STATUS,
    status: statusObj.status
  };
};
export const updateTimeStamp = timeStampObj => {
  return {
    type: UPDATE_TIMESTAMP,
    timeStamp: timeStampObj.time
  };
};

// THUNKS
// Make call to aws-amplify // WEB SOCKETS?
export const loadFormStatus = ({ userData }) => {
  return async dispatch => {
    // Call aws amplify endpoint. This is a placeholder
    const data = quarterForms;

    dispatch(getFormStatusData(data));
  };
};

// INITIAL STATE
const initialState = {
  forms: [...quarterForms]
};

// REDUCER
export default (state = initialState, action) => {
  switch (action.type) {
    case LOAD_FORMS:
      return {
        ...state,
        forms: action.formArray
      };
    case UPDATE_STATUS:
      // function here
      return {
        ...state,
        forms: [action.forms]
      };
    case UPDATE_TIMESTAMP:
      return {
        ...state,
        forms: action.formArray
      };

    default:
      return state;
  }
};

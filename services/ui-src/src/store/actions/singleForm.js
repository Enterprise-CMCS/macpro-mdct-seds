// ACTION TYPES
export const LOAD_SINGLE_FORM = "LOAD_SINGLE_FORM";

// ACTION CREATORS

export const getFormData = (formObj = {}) => {
  return {
    type: LOAD_SINGLE_FORM,
    formObj
  };
};

// THUNKS
// Make call to aws-amplify // WEB SOCKETS?
export const loadFormStatus = ({ userData }) => {
  return async dispatch => {
    // Call aws amplify endpoint. This is a placeholder
    const { data } = quarterForms;

    dispatch(getFormStatusData(data));
  };
};

// INITIAL STATE
const initialState = {
  formPlaceholder: "Some string!"
};

// REDUCER
export default (state = initialState, action) => {
  // switch statement
  switch (action.type) {
    case LOAD_SINGLE_FORM:
      return {
        ...state,
        formPlaceholder: action.formObj
      };
    default:
      return state;
  }
};

import initialForm from "./toDelete/initialFormData";

// ACTION TYPES
export const LOAD_FORMS = "LOAD_FORMS";

// ACTION CREATORS
export const getFormData = (formArray = []) => {
  return {
    type: LOAD_FORMS,
    formArray,
  };
};

// THUNKS
// Make call to aws-amplify
export const loadForm = ({ userData }) => {
  return async (dispatch) => {
    // Call aws amplify endpoint. This is a placeholder
    const { data } = initialForm;

    dispatch(getFormData(data));
  };
};

// INITIAL STATE
const initialState = {
  forms: [...initialForm],
};

// REDUCER
export default (state = initialState, action) => {
  switch (action.type) {
    case LOAD_FORMS:
      return {
        ...state,
        forms: action.formArray,
      };
    default:
      return state;
  }
};

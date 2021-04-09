// ACTION TYPES
export const SAVE_FORM = "SAVE_FORM";
export const SAVE_FORM_FAILURE = "SAVE_FORM_FAILURE";

// ACTION CREATORS
export const updateLastSaved = dateTime => {
  return {
    type: SAVE_FORM,
    dateTime
  };
};

// THUNK FUNCTIONS
export const saveForm = () => async (dispatch, user) => {
  try {
    // Update Database
    // graphQL call goes here

    // Update Last Saved in redux state
    dispatch(updateLastSaved(user));
  } catch (error) {
    // If updating the form data fails, state will remain unchanged
    dispatch({ type: SAVE_FORM_FAILURE });
  }
};

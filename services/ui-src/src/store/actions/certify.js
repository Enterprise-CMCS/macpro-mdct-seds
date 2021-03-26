// ACTION TYPES
export const CERTIFY_AND_SUBMIT_FINAL = "CERTIFY_AND_SUBMIT_FINAL";
export const CERTIFY_AND_SUBMIT_PROVISIONAL = "CERTIFY_AND_SUBMIT_PROVISIONAL";
export const CERTIFY_AND_SUBMIT_FAILURE = "CERTIFY_AND_SUBMIT_FAILURE";

// ACTION CREATORS
export const setFinalCertify = username => {
  return {
    type: CERTIFY_AND_SUBMIT_FINAL,
    username
  };
};
export const setProvisionalCertify = username => {
  return {
    type: CERTIFY_AND_SUBMIT_PROVISIONAL,
    username
  };
};

// THUNK FUNCTIONS
export const certifyAndSubmitFinal = () => async (dispatch, getState) => {
  const state = getState();
  const user = state.userData.username;

  try {
    dispatch(setFinalCertify(user));

    // Here we should trigger save functionality and save store to DB
    // CALL AWS Amplify, update form status, lastChanged, username and year
  } catch (error) {
    // If updating the status in DB fails, state will remain unchanged
    dispatch({ type: CERTIFY_AND_SUBMIT_FAILURE });
  }
};

export const certifyAndSubmitProvisional = () => async (dispatch, getState) => {
  const state = getState();
  const user = state.userData.username;//**** Need to add proper way to pull user information

  try {
    dispatch(setProvisionalCertify(user));
    // Here we should trigger save functionality and save store to DB
    // CALL AWS Amplify, update form status, lastChanged, username and year
  } catch (error) {
    // If updating the status in DB fails, state will remain unchanged
    dispatch({ type: CERTIFY_AND_SUBMIT_FAILURE });
  }
};

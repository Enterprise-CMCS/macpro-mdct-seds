export const CERTIFY_AND_SUBMIT = "CERTIFY_AND_SUBMIT";
export const CERTIFY_AND_SUBMIT_FAILURE = "CERTIFY_AND_SUBMIT_FAILURE";

export const setCertify = username => {
  return {
    type: CERTIFY_AND_SUBMIT,
    username
  };
};

export const certifyAndSubmit = () => async (dispatch, getState) => {
  const state = getState();
  const user = state.userData.username;

  try {
    // First: Update store
    dispatch(setCertify(user));

    // Second: Trigger save functionality and save store
    // CALL AWS Amplify, update form status, lastChanged, username and year
  } catch (error) {
    // If updating the status in DB fails, state will remain unchanged
    dispatch({ type: CERTIFY_AND_SUBMIT_FAILURE });
  }
};

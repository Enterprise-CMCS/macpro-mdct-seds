import { Auth } from "aws-amplify";
// ACTION TYPES
export const CERTIFY_AND_SUBMIT_FINAL = "CERTIFY_AND_SUBMIT_FINAL";
export const CERTIFY_AND_SUBMIT_PROVISIONAL = "CERTIFY_AND_SUBMIT_PROVISIONAL";
export const CERTIFY_AND_SUBMIT_FAILURE = "CERTIFY_AND_SUBMIT_FAILURE";

// ACTION CREATORS
export const setFinalCertify = userName => {
  return {
    type: CERTIFY_AND_SUBMIT_FINAL,
    userName
  };
};
export const setProvisionalCertify = userName => {
  return {
    type: CERTIFY_AND_SUBMIT_PROVISIONAL,
    userName
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
  let userName = await Auth.currentAuthenticatedUser();
  userName =
    userName.attributes.given_name + " " + userName.attributes.family_name;
  try {
    dispatch(setProvisionalCertify(userName));
  } catch (error) {
    dispatch({ type: CERTIFY_AND_SUBMIT_FAILURE });
  }
};

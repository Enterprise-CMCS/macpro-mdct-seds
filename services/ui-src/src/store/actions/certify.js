import { API } from "aws-amplify";
import {getUsername} from "../reducers/singleForm/singleForm";

// ACTION TYPES
export const CERTIFY_AND_SUBMIT_FINAL = "CERTIFY_AND_SUBMIT_FINAL";
export const CERTIFY_AND_SUBMIT_PROVISIONAL = "CERTIFY_AND_SUBMIT_PROVISIONAL";
export const UNCERTIFY = "UNCERTIFY";
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

export const setUncertify = username => {
  return {
    type: UNCERTIFY,
    username
  };
};

// THUNK FUNCTIONS
export const certifyAndSubmitFinal = () => async dispatch => {
  const username = await getUsername();
  try {
    dispatch(setFinalCertify(username)); 
  } catch (error) {
    dispatch({ type: CERTIFY_AND_SUBMIT_FAILURE });
  }
};

export const certifyAndSubmitProvisional = () => async dispatch => {
  const username = await getUsername();
  try {
    dispatch(setProvisionalCertify(username));
  } catch (error) {
    dispatch({ type: CERTIFY_AND_SUBMIT_FAILURE });
  }
};

export const uncertify = () => async dispatch => {
  const username = await getUsername();
  dispatch(setUncertify(username));
};

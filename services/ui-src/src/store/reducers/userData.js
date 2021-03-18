// ACTION TYPES
const USER_INFO = "USER_INFO";
const UPDATE_STATE_INFO = "STATE_INFO";
const UPDATE_ROLE = "UPDATE_ROLE";

// ACTION CREATORS
export const gotUserData = userObject => {
  return {
    type: USER_INFO,
    userObject
  };
};

export const getStateData = stateObject => ({
  type: UPDATE_STATE_INFO,
  name: stateObject.name,
  abbrev: stateObject.abbrev
});

export const updateRole = userObject => ({
  type: UPDATE_ROLE,
  role: userObject.role
});

// THUNKS
// Make call to aws-amplify // WEB SOCKETS?
export const getUser = ({ userData }) => {
  return async dispatch => {
    // Call aws amplify endpoint. This is a placeholder
    const data = initialState;

    dispatch(gotUserData(data));
  };
};

// If you're a state user, load all forms
// If you're not a state user, wait until a state is selected to load forms

// INITIAL STATE
const initialState = {
  userState: { name: "", abbrev: "" },
  programType: "",
  role: false,
  id: "",
  username: "",
  email: ""
};

// USER REDUCER
export default (state = initialState, action) => {
  switch (action.type) {
    case USER_INFO:
      return {
        ...action.userObject
      };
    case UPDATE_STATE_INFO:
      return {
        ...state,
        userState: {
          name: action.name,
          abbrev: action.abbrev
        }
      };
    case UPDATE_ROLE:
      return {
        ...state,
        role: action.role
      };
    default:
      return state;
  }
};

// ACTION TYPES
const USER_INFO = "USER_INFO";
const STATE_INFO = "STATE_INFO";
const UPDATE_ROLE = "UPDATE_ROLE";

// ACTION CREATORS
export const getUserData = (userObject) => {
  return {
    type: USER_INFO,
    userObject,
  };
};

export const getStateData = (stateObject) => ({
  type: STATE_INFO,
  name: stateObject.name,
  abbr: stateObject.abbr,
});

export const updateRole = (userObject) => ({
  type: UPDATE_ROLE,
  role: userObject.role,
});

// THUNKS
// Make call to aws-amplify
export const loadUser = ({ userData }) => {
  return async (dispatch) => {
    // Call aws amplify endpoint. This is a placeholder
    const { data } = initialState;

    dispatch(getUserData(data));
  };
};

// INITIAL STATE
const initialState = {
  name: "New York",
  abbr: "NY",
  currentUser: {
    role: false,
    state: { id: "", name: "" },
    username: "",
  },
};

// USER REDUCER
export default (state = initialState, action) => {
  switch (action.type) {
    case USER_INFO:
      return {
        ...state,
        currentUser: action.userObject,
      };
    case STATE_INFO:
      return {
        ...state,
        name: action.name,
        abbr: action.abbr,
      };
    case UPDATE_ROLE:
      return {
        ...state,
        currentUser: {
          ...state.currentUser,
          role: action.role,
        },
      };
    default:
      return state;
  }
};

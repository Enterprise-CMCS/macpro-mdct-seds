// ACTION TYPES
const STATE_INFO = "STATE_INFO";
const STATE_FORM_LIST = "STATE_FORM_LIST";

// ACTION CREATORS
export const gotStateFormList = FormList => {
    return {
        type: STATE_FORM_LIST,
        FormList
    };
};

// export const getStateFormList = stateObject => ({
//   type: STATE_FORM_LIST,
//   state: stateObject.name,
//   abbrev: stateObject.abbrev,
//   year: stateObject.year,
//   quarter:
//
// });

// CALL TO AWS
export const getStateFormList = ({ stateId, year, quarter}) => {
    return async dispatch => {
        // Call aws amplify endpoint. This is a placeholder
        const data = initialState;
        // Array of forms
        dispatch(gotStateFormList(data));
    };
};

// If you're a state user, load all forms
// If you're not a state user, wait until a state is selected to load forms

// INITIAL STATE
const initialState = {
    stateFormList:[],
};

// STATE REDUCER
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
        default:
            return state;
    }
};

// Here is where we should invoke functions that

import getUser from "./reducers/userData";
// import loadQuarterStatuses from "./reducers/quarterStatuses";
// import loadFormStatus from "./reducers/singleForm";

export const initialLoad = (userToken = "placeholder") => async dispatch => {
  // make some initial API call, invoke Thunks with returned data

  await Promise.all([
    // dispatch(loadFormStatus("placeholder")),
    dispatch(getUser("placeholder"))
  ]);
};

export default initialLoad;

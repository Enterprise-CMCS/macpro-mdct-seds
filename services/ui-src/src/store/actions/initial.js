// Here is where we should invoke functions that

import loadUser from "../userData";
import loadForm from "../formData";
// getUserData ()
// getFormData()

export const initialLoad = (userToken = "placeholder") => async (dispatch) => {
  // make some initial API call, invoke Thunks with returned data

  await Promise.all([
    dispatch(loadForm("placeholder")),
    dispatch(loadUser("placeholder")),
  ]);
};

export default initialLoad;

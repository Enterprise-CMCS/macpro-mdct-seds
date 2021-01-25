// Here is where we should invoke functions that return data necessary for initial page load

export const initialLoad = (userToken = "placeholder") => async dispatch => {
  // make some initial API calls

  await Promise.all([
    /// ... dispatch thunks necessary for initial load
  ]);
};

export default initialLoad;

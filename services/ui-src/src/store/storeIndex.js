import { createStore, combineReducers, applyMiddleware } from "redux";
import thunkMiddleware from "redux-thunk";
import { composeWithDevTools } from "redux-devtools-extension";
import quarterForms from "./quarterForms";
import userData from "./userData";

// Consolidate reducers
export const reducer = combineReducers({
  quarterForms,
  singleForm,
  userData
});

// Consolidate middleware
let middlewareArray = [thunkMiddleware];
// log redux only in dev environment
if (process.env.NODE_ENV === "development") {
  // eslint-disable-next-line global-require
  const { logger } = require("redux-logger");

  middlewareArray = [...middlewareArray, logger];
}
const middleware = composeWithDevTools(applyMiddleware(...middlewareArray));

// Create store with reducers and middleware
const store = createStore(reducer, middleware);

// Export the store to be picked up by the root component in index.js
export default store;

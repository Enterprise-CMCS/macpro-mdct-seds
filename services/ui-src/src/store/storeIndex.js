import { createStore, combineReducers, applyMiddleware } from "redux";
import thunkMiddleware from "redux-thunk";
import { composeWithDevTools } from "redux-devtools-extension";
import quarterStatuses from "./reducers/quarterStatuses";
import userData from "./reducers/userData";
import currentForm from "./reducers/singleForm";
import global from "./reducers/global";

// Consolidate reducers
export const reducers = combineReducers({
  quarterStatuses,
  currentForm,
  userData,
  global
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
const store = createStore(reducers, middleware);

// Export the store to be picked up by the root component in index.js
export default store;

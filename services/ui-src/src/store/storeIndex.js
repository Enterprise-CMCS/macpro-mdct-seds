import { createStore, combineReducers, applyMiddleware } from "redux";
import thunk from "redux-thunk";
import { composeWithDevTools } from "redux-devtools-extension";
import currentForm from "./reducers/singleForm/singleForm";
import { MODE } from "../utility-functions/environment";
import { logger } from "redux-logger";

// Consolidate reducers
export const reducers = combineReducers({ currentForm });

// Consolidate middleware
let middlewareArray = [thunk];
// log redux only in dev environment
if (MODE === "development") {
  middlewareArray = [...middlewareArray, logger];
}
const middleware = composeWithDevTools(applyMiddleware(...middlewareArray));

// Create store with reducers and middleware
const store = createStore(reducers, middleware);

// Export the store to be picked up by the root component in index.js
export default store;

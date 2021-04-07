import { createStore, applyMiddleware } from "redux";
import thunk from "redux-thunk";
import { reducers } from "../store/storeIndex";
import checkPropTypes from "check-prop-types";

import { currentFormMock_21E } from "../provider-mocks/currentFormMock_21E";

export const mockInitialState21E = { ...currentFormMock_21E };

export const findByTestAttribute = (wrapper, val) => {
  return wrapper.find(`.${val}`);
};

export const storeFactory = initialState => {
  return createStore(reducers, initialState, applyMiddleware(thunk));
};

// Returning undefined means no error was found
// Any problems are returned as an error message string.
export const checkProps = (component, conformingProps) => {
  const propError = checkPropTypes(
    component.propTypes,
    conformingProps,
    "prop",
    component.name
  );
  return propError;
};

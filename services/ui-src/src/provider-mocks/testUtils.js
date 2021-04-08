import { createStore, applyMiddleware } from "redux";
import thunk from "redux-thunk";
import { reducers } from "../store/storeIndex";
import checkPropTypes from "check-prop-types";

export const findByTestAttribute = (wrapper, val) => {
  return wrapper.find(`.${val}`);
};

export const storeFactory = initialState => {
  return createStore(reducers, initialState, applyMiddleware(thunk));
};

// Returning undefined means no error was found
// Any problems are returned as an error message string.
export const checkProps = (component, conformingProps) => {
  /* eslint-disable react/forbid-foreign-prop-types */
  const propError = checkPropTypes(
    component[propTypes],
    conformingProps,
    "prop",
    component[name]
  );
  console.log(`PROP ERROR??? ${component.name} \n\n\n\n\n\n`, propError);
  return propError;
};

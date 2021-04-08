import { createStore, applyMiddleware } from "redux";
import thunk from "redux-thunk";
import { reducers } from "../store/storeIndex";
import checkPropTypes from "check-prop-types";
import React from "react";

export const findByTestAttribute = (wrapper, val) => {
  return wrapper.find(`.${val}`);
};

export const storeFactory = initialState => {
  return createStore(reducers, initialState, applyMiddleware(thunk));
};

export const checkProps = (component, conformingProps) => {
  const propError = checkPropTypes(
    component.propTypes,
    conformingProps,
    "prop",
    component.name
  );
  return propError;
};

// REMOVE CHECK-PROP-TYPE PACKAGE

// import React, { Component } from "react";
// import { shallow } from "enzyme";
// import { createStore, applyMiddleware } from "redux";
// import thunk from "redux-thunk";

// import checkPropTypes from "check-prop-types";

// import { reducer } from "./store/storeIndex";

// export const findByTestAttribute = (wrapper, val) => {
//   return wrapper.find(`[data-test="${val}"]`);
// };

// export const storeFactory = (initialState) => {
//   return createStore(reducer, initialState, applyMiddleware(thunk));
// };

export const checkProps = (component, conformingProps) => {
  const propError = checkPropTypes(
    component.propTypes,
    conformingProps,
    "prop",
    component.name
  );
  return expect(propError).toBeUndefined();
};

const conmponentSpecificProps = { previousEntry: false };

const setup = (initialState = {}, props = {}) => {
  const setupProps = { ...conmponentSpecificProps, ...props };
  const store = storeFactory(initialState);
  return shallow(<DateRange store={store} {...setupProps} />)
    .dive()
    .dive();
};

const setupTopmostComponent = (initialState = {}, props = {}) => {
  const setupProps = { ...defaultProps, ...props };
  const store = storeFactory(initialState);
  return shallow(<DateRange store={store} {...setupProps} />);
};

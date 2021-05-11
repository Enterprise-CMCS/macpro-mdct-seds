import React from "react";
import StateSelector from "./StateSelector";
import { mount, shallow } from "enzyme";
import fullStoreMock from "../../provider-mocks/fullStoreMock";
import { storeFactory } from "../../provider-mocks/testUtils";
import Dropdown from "react-dropdown";
import { BrowserRouter } from "react-router-dom";

// The props this component requires in order to render
const defaultProps = {
  stateList: fullStoreMock.states
};

const shallowSetup = (initialState = {}, props = {}, path = "") => {
  const setupProps = { ...defaultProps, ...props };
  const store = storeFactory(initialState);
  return shallow(<StateSelector store={store} path={path} {...setupProps} />)
    .dive()
    .dive();
};

describe("StateSelector component", () => {
  const wrapper = shallowSetup(fullStoreMock);

  test("Should render the topmost classname", () => {
    expect(wrapper.find(".page-state-selector").length).toBe(1);
  });
  test("Should render the selection classname", () => {
    expect(wrapper.find(".action-buttons").length).toBe(1);
  });
  test("Should include a Dropdown component", () => {
    expect(wrapper.containsMatchingElement(<Dropdown />)).toEqual(true);
  });
});

describe("StateSelector component- props", () => {
  // creating a true shallow wrapper so that the props are accessible
  const tempStore = storeFactory(fullStoreMock);
  const wrapper = shallow(
    <StateSelector store={tempStore} {...defaultProps} />
  );

  test("Should include a stateList prop as an array", () => {
    expect(Array.isArray(wrapper.props().children.props.stateList)).toEqual(
      true
    );
  });
});

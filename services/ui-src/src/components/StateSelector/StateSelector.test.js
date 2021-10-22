import React from "react";
import StateSelector from "./StateSelector";
import { shallow } from "enzyme";
import fullStoreMock from "../../provider-mocks/fullStoreMock";
import { storeFactory } from "../../provider-mocks/testUtils";
import { Button } from "@trussworks/react-uswds";
import Dropdown from "react-dropdown";
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

  test("Should included child components thatare rendered", () => {
    expect(wrapper.find(Dropdown).length).toBe(1);
    expect(wrapper.find(Button).length).toBe(1);
  });

  describe("StateSelector component should behave as expected when the user interacts with the page", () => {
    test("should alert user of lack of state selection", () => {
      jest.spyOn(window, "alert").mockImplementation(() => {});

      expect(window.alert).not.toHaveBeenCalled();
      wrapper.find({ "data-testid": "SaveUpdatedUser" }).simulate("click");
      expect(window.alert).toBeCalledWith("Please select a state");
    });
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

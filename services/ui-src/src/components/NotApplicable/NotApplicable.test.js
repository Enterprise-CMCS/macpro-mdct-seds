import React from "react";
import { shallow, mount } from "enzyme";
import fullStoreMock from "../../provider-mocks/fullStoreMock";
import NotApplicable from "./NotApplicable";
import { storeFactory } from "../../provider-mocks/testUtils";
import { BrowserRouter } from "react-router-dom";
import { RangeInput } from "@trussworks/react-uswds";

// The props this component requires in order to render
const defaultProps = {
  notApplicable: false,
  status: "In Progress",
  statusId: 2,
  statusTypes: [fullStoreMock.global.statuses],
  updatedApplicableStatus: function () {},
  resetData: function () {}
};

const shallowSetup = (initialState = {}, props = {}, path = "") => {
  const setupProps = { ...defaultProps, ...props };
  const store = storeFactory(initialState);
  return shallow(<NotApplicable store={store} path={path} {...setupProps} />)
    .dive()
    .dive();
};
const mountSetup = (initialState = {}, props = {}, path = "") => {
  const setupProps = { ...defaultProps, ...props };
  const store = storeFactory(initialState);
  return mount(
    <BrowserRouter>
      {" "}
      <NotApplicable store={store} path={path} {...setupProps} />{" "}
    </BrowserRouter>
  );
};

describe("NotApplicable component- includes data attributes", () => {
  const wrapper = shallowSetup(fullStoreMock);

  test("Should include data attribute: applicable-wrapper", () => {
    expect(wrapper.find(`[data-test="applicable-wrapper"]`).length).toBe(1);
  });

  test("Should include data attribute: applicable-prompt", () => {
    expect(wrapper.find(`[data-test="applicable-prompt"]`).length).toBe(1);
  });

  test("Should include data attribute: applicable-slider", () => {
    expect(wrapper.find(`[data-test="applicable-slider"]`).length).toBe(1);
  });
  test("Should include data attribute: slider-input", () => {
    expect(wrapper.find(`[data-test="slider-input"]`).length).toBe(1);
  });
  test("Should include RangeInput component", () => {
    expect(wrapper.containsMatchingElement(<RangeInput />)).toEqual(true);
  });
});

describe("NotApplicable component- props", () => {
  // creating a true shallow wrapper so that the props are accessible
  const tempStore = storeFactory(fullStoreMock);
  const wrapper = shallow(
    <NotApplicable store={tempStore} {...defaultProps} />
  );

  test("Should include a notApplicable prop as a boolean", () => {
    expect(typeof wrapper.props().children.props.notApplicable).toEqual(
      "boolean"
    );
  });

  test("Should include a resetData prop as a function", () => {
    expect(typeof wrapper.props().children.props.resetData).toEqual("function");
  });
  test("Should include a status prop as a string", () => {
    expect(typeof wrapper.props().children.props.status).toEqual("string");
  });
  test("Should include a statusTypes prop as an array", () => {
    expect(Array.isArray(wrapper.props().children.props.statusTypes)).toEqual(
      true
    );
  });
});

describe("NotApplicable component- disabled functionality", () => {
  const inProgressProps = {
    status: "In Progress"
  };
  let wrapper = mountSetup(fullStoreMock, inProgressProps);
  test("Only one status should be selected", () => {
    expect(wrapper.find(".is-selected").length).toBe(1);
  });
  test("When the form status is `in progress` Applicable should be selected", () => {
    expect(wrapper.find(".applicable-selected").length).toBe(1);
  });
  test("When the form status is `in progress` Not Applicable should not be selected", () => {
    expect(wrapper.find(".not-applicable-selected").length).toBe(0);
  });
});

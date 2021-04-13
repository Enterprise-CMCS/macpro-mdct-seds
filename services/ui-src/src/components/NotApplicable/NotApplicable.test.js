import React from "react";
import { shallow } from "enzyme";
import fullStoreMock from "../../provider-mocks/fullStoreMock";
import NotApplicable from "./NotApplicable";
import { storeFactory } from "../../provider-mocks/testUtils";

// The props this component requires in order to render
const defaultProps = {};

// PROPS NEEDED
//   toggle: PropTypes.func.isRequired,
//   statusObject: PropTypes.object.isRequired,
//   last_modified_by: PropTypes.string.isRequired,
//   last_modified: PropTypes.string.isRequired,
//   not_applicable: PropTypes.bool.isRequired,
//   status: PropTypes.string.isRequired

const shallowSetup = (initialState = {}, props = {}, path = "") => {
  const setupProps = { ...defaultProps, ...props };
  const store = storeFactory(initialState);
  return shallow(<NotApplicable store={store} path={path} {...setupProps} />)
    .dive()
    .dive();
};

// Mock the useParams react-router-dom function
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"), // use actual for all non-hook parts
  useParams: () => ({
    state: "AL",
    year: "2021",
    quarter: "01",
    formName: "21E"
  })
}));

describe("NotApplicable component- includes HTML elements", () => {
  test("Should include a h3", () => {
    // expect(wrapper.find(".form-header-main").length).toBe(1);
  });

  test("Should include h2", () => {
    // expect(wrapper.find(".tab-container").length).toBe(1);
  });

  test("Should include range input", () => {
    // expect(wrapper.find(".form-footer").length).toBe(1);
  });
  test("Should include range input component", () => {
    // expect(wrapper.find(".form-footer").length).toBe(1);
  });
});

describe("NotApplicable component- disabled functionality", () => {
  test("Status should change when button clicked", () => {
    // expect(wrapper.find(".form-header-main").length).toBe(1);
  });

  test("Status should change based on incoming props- status", () => {
    // expect(wrapper.find(".tab-container").length).toBe(1);
  });
  test("Status should change based on incoming props- status", () => {
    // expect(wrapper.find(".tab-container").length).toBe(1);
  });
  test("Status should change based on incoming props- status", () => {
    // expect(wrapper.find(".tab-container").length).toBe(1);
  });
  test("Status should change based on incoming props- status", () => {
    // expect(wrapper.find(".tab-container").length).toBe(1);
  });
});

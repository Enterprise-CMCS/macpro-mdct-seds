import React, { Component } from "react";
import { shallow, mount } from "enzyme";
import { Provider } from "react-redux";
import {
  storeFactory,
  findByTestAttribute
} from "../../provider-mocks/testUtils";
import currentFormMock_21E from "../../provider-mocks/currentFormMock_21E";

import configureStore from "redux-mock-store";

import FormPage from "./FormPage";
import Routes from "../Routes/Routes";

// import { render } from "@testing-library/react";

// FormPage.propTypes = {
//     statusData: PropTypes.object.isRequired,
//     getForm: PropTypes.func.isRequired
//   };

const mockStore = configureStore([]);

describe("FormPage component- shallow render includes classNames", () => {
  let store;
  let wrapper;

  beforeEach(() => {
    store = mockStore(currentFormMock_21E);
    wrapper = mount(
      <Provider store={store}>
        <FormPage />
      </Provider>
    );
  });

  jest.mock("react-router", () => ({
    useParams: jest.fn().mockReturnValue({
      state: "AL",
      year: "2021",
      quarter: "01",
      formName: "21E"
    })
  }));

  test("Should include a form-header className", () => {
    // wrapper = shallowSetup(currentFormMock_21E);

    console.log("DEBUG!!! \n\n\n\n", wrapper.debug());
    expect(wrapper.find(".header").length).toBe(1);
  });

  //   test("Should include a tab-container className", () => {});

  //   test("Should include a form-footer className", () => {});
});

describe("FormPage component- incoming props", () => {
  test("Accurate props should return no error", () => {});
  test("Inaccurate props should return an error", () => {});
  test("Should include a statusData prop as an object", () => {});

  test("Should include a getForm prop as a function", () => {});
  test("Accesses params from the URL", () => {});
});
describe("FormPage component- Child Components", () => {
  test("Should include a FormHeader component", () => {});
  test("Should include a TabContainer component", () => {});
  test("Should include a FormFooter component", () => {});
});

// if the store starts empty, does the rendering of FormPage populate it??

describe("FormPage component- useEffect", () => {
  test("Populates the redux store, based on the params", () => {});
  test("Triggers useEffect at least once", () => {});
});

// component.debug() will show you what its getting

// TESTS TODO:
// setup store factory
// look at test suite setup
// look at test helper functions

// CAN DO:
// check proptypes (n props = n tests)
// check that statusData is present and is an object
// check that getForm is present and is a function
// check that form-header classname is present
// check that form-footer classname is present
// check that tab-container classname is present

// UNSURE:
// mount it and check that footer and header children classnames are present
// mount it and check if variables are set ??
// trigger getForm and confirm that the store is changed

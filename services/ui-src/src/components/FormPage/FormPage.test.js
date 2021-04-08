import React from "react";
import { mount, shallow } from "enzyme";
import { Provider } from "react-redux";
import fullStoreMock from "../../provider-mocks/fullStoreMock";
import currentFormMock_21E from "../../provider-mocks/currentFormMock_21E";
import configureStore from "redux-mock-store";
import FormPage from "./FormPage";
import { storeFactory, checkProps } from "../../provider-mocks/testUtils";
import checkPropTypes from "check-prop-types";

import FormHeader from "../FormHeader/FormHeader";
import FormFooter from "../FormFooter/FormFooter";
import TabContainer from "../TabContainer/TabContainer";
import { wrap } from "yargs";

const shallowSetup = (initialState = {}, props = {}, path = "") => {
  const setupProps = { ...defaultProps, ...props };
  const store = storeFactory(initialState);
  return shallow(<FormPage store={store} path={path} {...setupProps} />)
    .dive()
    .dive();
};
const mountedSetup = (initialState = {}, props = {}, path = "") => {
  const setupProps = { ...defaultProps, ...props };
  const store = storeFactory(initialState);
  return mount(
    <Provider store={store}>
      <FormPage path={path} {...setupProps} />
    </Provider>
  );
};

// The props this component requires in order to render
const defaultProps = {
  statusData: { last_modified: "01-15-2021" },
  getForm: function () {
    return;
  }
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

describe("FormPage component- shallow render includes classNames", () => {
  const wrapper = shallowSetup(fullStoreMock);
  test("Should include a form-header className", () => {
    expect(wrapper.find(".form-header-main").length).toBe(1);
  });

  test("Should include a tab-container className", () => {
    expect(wrapper.find(".tab-container").length).toBe(1);
  });

  test("Should include a form-footer className", () => {
    expect(wrapper.find(".form-footer").length).toBe(1);
  });
});

describe("FormPage component- incoming props", () => {
  let wrapper;
  beforeEach(() => {
    wrapper = mountedSetup(fullStoreMock);
  });

  //   const wrapper = shallowSetup(fullStoreMock);

  //   test("Accurate props should return no error", () => {
  //     const propsErr = checkProps(FormPage, defaultProps);
  //     expect(propsErr).toBeUndefined();
  //   });

  //   test("Inaccurate prop types should return an error (statusData)", () => {
  //     const badProps = {
  //       statusData: "I should be an object!",
  //       getForm: function () {
  //         return;
  //       }
  //     };
  //     const propsErr = checkProps(FormPage, badProps);
  //     expect(propsErr).toBeUndefined();
  //   });

  it("Should not render when given no props", () => {
    const found = wrapper.find(".form-footer");
    expect(found.length).toBe(0);
  });

  //   test("Inaccurate prop types should return an error (getForm)", () => {
  //     const badProps = {
  //       statusData: { last_modified: "01-15-2021" },
  //       getForm: "I should be a function!"
  //     };
  //     expect(checkProps(FormPage, badProps)).toBe(
  //       "Failed prop type: Invalid prop `getForm` of type `string` supplied to `FormPage`, expected `function`."
  //     );
  //   });
  //   test("Should include a statusData prop as an object", () => {

  //   });

  //   test("Should include a getForm prop as a function", () => {
  //     expect(wrapper.prop("statusData")).toEqual(null);
  //   });
});

describe("FormPage component- Child Components", () => {
  let state = "AL";
  let year = "2021";
  let quarter = "1";
  let formName = "21E";
  let last_modified = "01-15-2021";

  const wrapper = shallowSetup(fullStoreMock);

  test("Should include a FormHeader component", () => {
    expect(
      wrapper.containsMatchingElement(
        <FormHeader
          quarter={quarter}
          form={formName}
          year={year}
          state={state}
        />
      )
    ).toEqual(true);
  });
  test("Should include a FormFooter component", () => {
    expect(
      wrapper.containsMatchingElement(
        <FormFooter
          state={state}
          year={year}
          quarter={quarter}
          lastModified={last_modified}
        />
      )
    ).toEqual(true);
  });
  test("Should include a (connected) TabContainer component", () => {
    expect(wrapper.find("Connect(TabContainer)")).toHaveLength(1);
  });
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
